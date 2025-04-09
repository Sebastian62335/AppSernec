
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';

export function SalariosForm({ onSalarioUpdated }) {
  const [salarios, setSalarios] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [nuevoSalario, setNuevoSalario] = useState({
    persona: '',
    salario_por_hora: ''
  });

  useEffect(() => {
    fetchSalarios();
    fetchPersonas();
  }, []);

  async function fetchSalarios() {
    const { data, error } = await supabase
      .from('salarios_empleados')
      .select('*')
      .order('persona');

    if (!error) {
      setSalarios(data);
    }
  }

  async function fetchPersonas() {
    const { data, error } = await supabase
      .from('registros_produccion')
      .select('persona')
      .order('persona');

    if (!error) {
      const personasUnicas = [...new Set(data.map(r => r.persona))];
      setPersonas(personasUnicas.sort());
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { error } = await supabase
      .from('salarios_empleados')
      .upsert([nuevoSalario], {
        onConflict: 'persona'
      });

    if (!error) {
      await fetchSalarios();
      setNuevoSalario({ persona: '', salario_por_hora: '' });
      if (onSalarioUpdated) onSalarioUpdated();
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Gestión de Salarios</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="persona">Persona</Label>
            <Select
              id="persona"
              value={nuevoSalario.persona}
              onChange={(e) => setNuevoSalario({...nuevoSalario, persona: e.target.value})}
              required
              className="mt-1"
            >
              <option value="">Seleccionar persona</option>
              {personas.map(persona => (
                <option key={persona} value={persona}>{persona}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="salario">Salario por Hora</Label>
            <Input
              id="salario"
              type="number"
              step="0.01"
              value={nuevoSalario.salario_por_hora}
              onChange={(e) => setNuevoSalario({...nuevoSalario, salario_por_hora: e.target.value})}
              required
            />
          </div>
        </div>
        <Button type="submit" className="w-full">Guardar Salario</Button>
      </form>

      <div className="mt-6">
        <h3 className="font-semibold mb-2">Salarios Actuales</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2">Persona</th>
                <th className="px-4 py-2">Salario por Hora</th>
              </tr>
            </thead>
            <tbody>
              {salarios.map((salario, index) => (
                <tr key={index} className="border-b">
                  <td className="px-4 py-2">{salario.persona}</td>
                  <td className="px-4 py-2">${salario.salario_por_hora}/hora</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

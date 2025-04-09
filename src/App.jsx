
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { format } from 'date-fns';
import { ChartSection } from '@/components/ChartSection';
import { SalariosForm } from '@/components/SalariosForm';
import { CostoOP } from '@/components/CostoOP';

function App() {
  const [registros, setRegistros] = useState([]);
  const [tipoAgrupacion, setTipoAgrupacion] = useState('op');
  const [formData, setFormData] = useState({
    fecha: format(new Date(), 'yyyy-MM-dd'),
    persona: '',
    op: '',
    cantidad: '',
    item: '',
    tiempo_mecanizado: '',
    tamano: '',
    maquina: '',
    observaciones: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchRegistros();
  }, []);

  async function fetchRegistros() {
    const { data, error } = await supabase
      .from('registros_produccion')
      .select('*')
      .order('fecha', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los registros",
        variant: "destructive"
      });
    } else {
      setRegistros(data);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { error } = await supabase
      .from('registros_produccion')
      .insert([formData]);

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el registro",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Éxito",
        description: "Registro guardado correctamente"
      });
      fetchRegistros();
      setFormData({
        fecha: format(new Date(), 'yyyy-MM-dd'),
        persona: '',
        op: '',
        cantidad: '',
        item: '',
        tiempo_mecanizado: '',
        tamano: '',
        maquina: '',
        observaciones: ''
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Sistema de Producción - Cilindros Hidráulicos</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Nuevo Registro</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fecha">Fecha</Label>
                  <Input
                    id="fecha"
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="persona">Persona</Label>
                  <Input
                    id="persona"
                    value={formData.persona}
                    onChange={(e) => setFormData({...formData, persona: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="op">OP</Label>
                  <Input
                    id="op"
                    value={formData.op}
                    onChange={(e) => setFormData({...formData, op: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cantidad">Cantidad</Label>
                  <Input
                    id="cantidad"
                    type="number"
                    value={formData.cantidad}
                    onChange={(e) => setFormData({...formData, cantidad: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="item">Item</Label>
                  <Input
                    id="item"
                    value={formData.item}
                    onChange={(e) => setFormData({...formData, item: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tiempo_mecanizado">Tiempo de Mecanizado (min)</Label>
                  <Input
                    id="tiempo_mecanizado"
                    type="number"
                    value={formData.tiempo_mecanizado}
                    onChange={(e) => setFormData({...formData, tiempo_mecanizado: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tamano">Tamaño</Label>
                  <Input
                    id="tamano"
                    value={formData.tamano}
                    onChange={(e) => setFormData({...formData, tamano: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="maquina">Máquina</Label>
                  <Input
                    id="maquina"
                    value={formData.maquina}
                    onChange={(e) => setFormData({...formData, maquina: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea
                  id="observaciones"
                  value={formData.observaciones}
                  onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                />
              </div>
              <Button type="submit" className="w-full">Guardar Registro</Button>
            </form>
          </div>

          <SalariosForm onSalarioUpdated={fetchRegistros} />
        </div>

        <div className="space-y-8">
          <ChartSection
            registros={registros}
            tipoAgrupacion={tipoAgrupacion}
            setTipoAgrupacion={setTipoAgrupacion}
          />
          
          <CostoOP registros={registros} />
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow-lg overflow-x-auto">
        <h2 className="text-xl font-semibold mb-4">Registros Recientes</h2>
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2">Fecha</th>
              <th className="px-4 py-2">Persona</th>
              <th className="px-4 py-2">OP</th>
              <th className="px-4 py-2">Item</th>
              <th className="px-4 py-2">Cantidad</th>
              <th className="px-4 py-2">Tiempo</th>
              <th className="px-4 py-2">Máquina</th>
            </tr>
          </thead>
          <tbody>
            {registros.map((registro, index) => (
              <tr key={index} className="border-b">
                <td className="px-4 py-2">{format(new Date(registro.fecha), 'dd/MM/yyyy')}</td>
                <td className="px-4 py-2">{registro.persona}</td>
                <td className="px-4 py-2">{registro.op}</td>
                <td className="px-4 py-2">{registro.item}</td>
                <td className="px-4 py-2">{registro.cantidad}</td>
                <td className="px-4 py-2">{registro.tiempo_mecanizado} min</td>
                <td className="px-4 py-2">{registro.maquina}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Toaster />
    </div>
  );
}

export default App;

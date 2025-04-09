
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function CostoOP({ registros }) {
  const [salarios, setSalarios] = useState({});
  const [costosOP, setCostosOP] = useState({});

  useEffect(() => {
    fetchSalarios();
  }, []);

  useEffect(() => {
    calcularCostosOP();
  }, [registros, salarios]);

  async function fetchSalarios() {
    const { data, error } = await supabase
      .from('salarios_empleados')
      .select('*');

    if (!error) {
      const salariosMap = {};
      data.forEach(s => {
        salariosMap[s.persona] = parseFloat(s.salario_por_hora);
      });
      setSalarios(salariosMap);
    }
  }

  function calcularCostosOP() {
    const costos = registros.reduce((acc, registro) => {
      const salarioPorHora = salarios[registro.persona] || 0;
      const tiempoHoras = parseInt(registro.tiempo_mecanizado) / 60;
      const costo = salarioPorHora * tiempoHoras;

      if (!acc[registro.op]) {
        acc[registro.op] = {
          tiempoTotal: 0,
          costoTotal: 0,
          detalles: []
        };
      }

      acc[registro.op].tiempoTotal += parseInt(registro.tiempo_mecanizado);
      acc[registro.op].costoTotal += costo;
      acc[registro.op].detalles.push({
        persona: registro.persona,
        tiempo: registro.tiempo_mecanizado,
        costo
      });

      return acc;
    }, {});

    setCostosOP(costos);
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Costos por OP</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2">OP</th>
              <th className="px-4 py-2">Tiempo Total (min)</th>
              <th className="px-4 py-2">Costo Total</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(costosOP).map(([op, datos]) => (
              <tr key={op} className="border-b">
                <td className="px-4 py-2">{op}</td>
                <td className="px-4 py-2">{datos.tiempoTotal}</td>
                <td className="px-4 py-2">${datos.costoTotal.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

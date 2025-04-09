
import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export function ChartSection({ registros, tipoAgrupacion, setTipoAgrupacion }) {
  const [selectedOP, setSelectedOP] = useState('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM'));
  const [opcionesFiltro, setOpcionesFiltro] = useState({
    ops: [],
    fechas: []
  });

  useEffect(() => {
    const ops = [...new Set(registros.map(r => r.op))];
    const fechas = [...new Set(registros.map(r => format(parseISO(r.fecha), 'yyyy-MM')))];
    
    setOpcionesFiltro({
      ops: ops.sort(),
      fechas: fechas.sort().reverse()
    });
  }, [registros]);

  const filtrarRegistros = (datos) => {
    return datos.filter(registro => {
      if (tipoAgrupacion === 'op' && selectedOP) {
        return registro.op === selectedOP;
      }
      if (tipoAgrupacion === 'mes' && selectedDate) {
        const fechaRegistro = format(parseISO(registro.fecha), 'yyyy-MM');
        return fechaRegistro === selectedDate;
      }
      return true;
    });
  };

  const agruparPorOP = (datos) => {
    const datosFiltrados = filtrarRegistros(datos);
    const grupos = datosFiltrados.reduce((acc, registro) => {
      if (!acc[registro.op]) {
        acc[registro.op] = {
          tiempoTotal: 0,
          items: {}
        };
      }
      acc[registro.op].tiempoTotal += parseInt(registro.tiempo_mecanizado);
      if (!acc[registro.op].items[registro.item]) {
        acc[registro.op].items[registro.item] = 0;
      }
      acc[registro.op].items[registro.item] += parseInt(registro.tiempo_mecanizado);
      return acc;
    }, {});

    return {
      labels: Object.keys(grupos),
      datasets: [{
        label: 'Tiempo Total (min)',
        data: Object.values(grupos).map(g => g.tiempoTotal),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      }]
    };
  };

  const agruparPorMes = (datos) => {
    const datosFiltrados = filtrarRegistros(datos);
    const grupos = datosFiltrados.reduce((acc, registro) => {
      const fecha = parseISO(registro.fecha);
      const mesKey = format(fecha, 'yyyy-MM');
      const mesLabel = format(fecha, 'MMMM yyyy', { locale: es });
      
      if (!acc[mesKey]) {
        acc[mesKey] = {
          label: mesLabel,
          tiempoTotal: 0,
          personas: {}
        };
      }
      acc[mesKey].tiempoTotal += parseInt(registro.tiempo_mecanizado);
      
      if (!acc[mesKey].personas[registro.persona]) {
        acc[mesKey].personas[registro.persona] = 0;
      }
      acc[mesKey].personas[registro.persona] += parseInt(registro.tiempo_mecanizado);
      
      return acc;
    }, {});

    return {
      labels: Object.values(grupos).map(g => g.label),
      datasets: [{
        label: 'Tiempo Total por Mes (min)',
        data: Object.values(grupos).map(g => g.tiempoTotal),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      }]
    };
  };

  const chartData = tipoAgrupacion === 'op' ? agruparPorOP(registros) : agruparPorMes(registros);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: tipoAgrupacion === 'op' ? 'Tiempo Total por OP' : 'Tiempo Total por Mes',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Tiempo (minutos)'
        }
      },
      x: {
        title: {
          display: true,
          text: tipoAgrupacion === 'op' ? 'Orden de Producción' : 'Mes'
        }
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="tipoAgrupacion">Agrupar por:</Label>
          <Select
            id="tipoAgrupacion"
            value={tipoAgrupacion}
            onChange={(e) => {
              setTipoAgrupacion(e.target.value);
              setSelectedOP('');
              setSelectedDate(format(new Date(), 'yyyy-MM'));
            }}
            className="mt-1"
          >
            <option value="op">Orden de Producción (OP)</option>
            <option value="mes">Mes</option>
          </Select>
        </div>

        {tipoAgrupacion === 'op' && (
          <div>
            <Label htmlFor="selectedOP">Seleccionar OP:</Label>
            <Select
              id="selectedOP"
              value={selectedOP}
              onChange={(e) => setSelectedOP(e.target.value)}
              className="mt-1"
            >
              <option value="">Todas las OPs</option>
              {opcionesFiltro.ops.map(op => (
                <option key={op} value={op}>{op}</option>
              ))}
            </Select>
          </div>
        )}

        {tipoAgrupacion === 'mes' && (
          <div>
            <Label htmlFor="selectedDate">Seleccionar Mes:</Label>
            <Select
              id="selectedDate"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="mt-1"
            >
              {opcionesFiltro.fechas.map(fecha => (
                <option key={fecha} value={fecha}>
                  {format(parseISO(`${fecha}-01`), 'MMMM yyyy', { locale: es })}
                </option>
              ))}
            </Select>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">
          {tipoAgrupacion === 'op' ? 'Tiempo Total por OP' : 'Tiempo Total por Mes'}
        </h2>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}

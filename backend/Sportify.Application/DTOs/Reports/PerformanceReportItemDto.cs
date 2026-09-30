using System;

namespace Sportify.Application.DTOs.Reports
{
    public class PerformanceReportItemDto
    {
        public string Atleta { get; set; } = string.Empty;
        public DateTime? FechaUltimaAsistencia { get; set; }
        public string Competencia { get; set; } = string.Empty;
        public DateTime FechaCompetencia { get; set; }
        public string Observaciones { get; set; } = string.Empty;
    }
}

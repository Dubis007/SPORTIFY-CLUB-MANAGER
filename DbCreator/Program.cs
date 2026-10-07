using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.DependencyInjection;
using Sportify.Infrastructure.Persistence;

class Program {
    static void Main() {
        var services = new ServiceCollection();
        services.AddDbContext<SportifyDbContext>(o => o.UseMySQL("Server=localhost;Port=3306;Database=sportify_db;Uid=root;Pwd=;"));
        services.AddEntityFrameworkDesignTimeServices();
        var provider = services.BuildServiceProvider();
        var scaffolder = provider.GetRequiredService<Microsoft.EntityFrameworkCore.Migrations.Design.IMigrationsScaffolder>();
        var migration = scaffolder.ScaffoldMigration("InitialCreate", "Sportify.Infrastructure");
        var saved = scaffolder.Save("C:\\Users\\duvan\\OneDrive\\Documentos\\nuevas_tecnologias_2026\\PROYECTO\\SPORTIFY-CLUB-MANAGER\\backend\\Sportify.Infrastructure", migration, "C:\\Users\\duvan\\OneDrive\\Documentos\\nuevas_tecnologias_2026\\PROYECTO\\SPORTIFY-CLUB-MANAGER\\backend\\Sportify.Infrastructure\\Persistence\\Migrations");
        Console.WriteLine("Done.");
    }
}

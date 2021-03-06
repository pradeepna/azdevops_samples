const AzDev = require("azure-devops-node-api");
const Dotenv = require("dotenv");
const Yargs = require("yargs");

Dotenv.config();

const argv = Yargs.usage("Usage: node $0 <options>")
                  .alias("o", "org_url")
                  .alias("s", "source_project")
                  .alias("st", "source_team")
                  .alias("d", "dest_project")
                  .alias("dt", "dest_team")
                  .alias("i", "dashboard_id")
                  .demandOption(["o", "s", "d", "i", "st", "dt"])
                  .argv;
             
const pat = process.env.PAT;

const org = argv.org_url;
const sourceProject = argv.source_project;
const destProject = argv.dest_project;
const dashboardId = argv.dashboard_id;
const sourceTeam = argv.source_team;
const destTeam = argv.dest_team;

const authHandler = AzDev.getPersonalAccessTokenHandler(pat);
const connection = new AzDev.WebApi(org, authHandler);

function validate(arg, message) {
    if (!arg) {
        console.error(message);
        process.exit(1);
    }
}

async function copy_dashboard(sourceProjectName, sourceTeamName, destProjectName, destTeamName, dashboardId) {
    try {
        const coreApi = await connection.getCoreApi();
        const dashboardApi = await connection.getDashboardApi();
        const sourceProject = await coreApi.getProject(sourceProjectName);
        validate(sourceProject, `Source project '${sourceProjectName}' does not exist`);

        const sourceTeam = await coreApi.getTeam(sourceProject.id, sourceTeamName);
        validate(sourceTeam, `Source team '${sourceTeamName}' does not exist`)

        const teamContext = { 
            project: sourceProject.name,
            projectId: sourceProject.id,
            team: sourceTeam.name,
            teamId: sourceTeam.id
        };

        const dashboard = await dashboardApi.getDashboard(teamContext, dashboardId);
        validate(dashboard, `Dashboard with id '${dashboardId}' does not exist`)

        const destProject = await coreApi.getProject(destProjectName);
        validate(destProject, `Dest project '${destProjectName}' does not exist`);

        const destTeam = await coreApi.getTeam(destProject.name, destTeamName);
        validate(destTeam, `Dest team '${destTeamName}' does not exist`);

        const destTeamContext = {
            project: destProject.name,
            projectId: destProject.id,
            team: destTeam.name,
            teamId: destTeam.id
        }

        delete dashboard.id;
        dashboard.name = `Copied ${dashboard.name}`
        const clonedDashboard = await dashboardApi.createDashboard(dashboard, destTeamContext);
        console.log(`New dashboard with id ${clonedDashboard.id} created`);
    }
    catch (error) {
        console.error(error.message);
    }
}

copy_dashboard(sourceProject, sourceTeam, destProject, destTeam, dashboardId);





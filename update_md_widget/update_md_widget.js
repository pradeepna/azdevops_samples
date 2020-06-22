const azdev = require("azure-devops-node-api");
const dotenv = require("dotenv");
const yargs = require("yargs");
const fs = require("fs");
const axios = require("axios").default;

dotenv.config();

const argv = yargs.usage("Usage: node $0 <options>")
                  .alias("o", "org_url")
                  .alias("p", "project")
                  .alias("t", "team")
                  .alias("d", "dashboard_id")
                  .alias("w", "widget_title_string")
                  .demandOption(["o", "p", "t", "d", "w"])
                  .argv;
             
const pat = process.env.PAT;

const org = argv.org_url;
const project = argv.project;
const team = argv.team;
const dashboardId = argv.dashboard_id;
const widgetTitleContains = argv.widget_title_string;

const authHandler = azdev.getPersonalAccessTokenHandler(pat);
const connection = new azdev.WebApi(org, authHandler);

function validate(arg, message) {
    if (!arg) {
        console.error(message);
        process.exit(1);
    }
}

async function updateMarkdownWidget(projectName, teamName, dashboardId, widgetTitleContains, newMarkdown) {
    try {
        const coreApi = await connection.getCoreApi();
        const dashboardApi = await connection.getDashboardApi();
        const project = await coreApi.getProject(projectName);
        validate(project, `Project '${project}' does not exist`);

        const team = await coreApi.getTeam(project.id, teamName);
        validate(team, `Team '${teamName}' does not exist`)

        const widgetsUrl = org + `/${projectName}/${teamName}/_apis/dashboard/dashboards/${dashboardId}/widgets`;
        const base64Pat = Buffer.from(`PAT:${pat}`).toString('base64');
        response = await axios.get(widgetsUrl, {
            headers: {
                "Authorization": `Basic ${base64Pat}`
            }
        });
        if (response.status > 210) {
            console.error(`Error: ${response.status}`)
            return;
        }

        console.log(`Fetching all widgets in dashboard: ${dashboardId}...`);
        const widgets = response.data.value;
        if (!widgets || widgets.length === 0) {
            console.error(`No widgets in dashboard with id ${dashboardId}`);
            return;
        }
        
        console.log(`Filtering custom markdown widgets...`);
        const filteredWidgets = widgets.filter(w => w.typeId === "Microsoft.VisualStudioOnline.Dashboards.MarkdownWidget" &&
                                               w.settings &&
                                               w.settings.indexOf("repositoryId") <= 0 &&
                                               w.settings.split("\n")[0] &&
                                               w.settings.split("\n")[0].indexOf(widgetTitleContains) >= 0);

        if (filteredWidgets.length === 0) {
            console.error(`No widget found where title contains '${widgetTitleContains}'`);
            let titles = widgets.map(w => {
                if (w.typeId === "Microsoft.VisualStudioOnline.Dashboards.MarkdownWidget" && 
                    w.settings &&
                    w.settings.indexOf("repositoryId") <= 0) {
                    return w.settings.split("\n")[0]
                }
                else {
                    return "";
                }
            }); 

            titles = titles.filter(t => t !== "");
            console.log("Below are the titles found:");
            console.log(titles.join("\n"));
            return;
        }

        if (filteredWidgets.length > 1) {
            console.error(`More than one widget found where title contains '${widgetTitleContains}'. Please specify a widget name that matches a single widgets`);
            return;
        }

        console.log(`Found one widget where widget title contains '${widgetTitleContains}' in dashboard: ${dashboardId}...`);
        const widgetToReplace = filteredWidgets[0];
        const teamContext = { 
            project: project.name,
            projectId: project.id,
            team: team.name,
            teamId: team.id
        };

        const widget = await dashboardApi.getWidget(teamContext, dashboardId, widgetToReplace.id);
        widget.settings = newMarkdown;
        
        console.log(`Updating widget '${widgetTitleContains}'...`);
        await dashboardApi.updateWidget(widget, teamContext, dashboardId, widget.id);

        console.log(`Widget ${widgetTitleContains} replaced successfully`);
    }
    catch (error) {
        console.error(error.message);
    }
}

data = fs.readFileSync("./newMarkdown.md", {encoding: "utf-8", flag: "r"})
updateMarkdownWidget(project, team, dashboardId, widgetTitleContains, data);





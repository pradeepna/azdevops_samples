const Azdev = require("azure-devops-node-api");
const Dotenv = require("dotenv");
const WorkApi = require("azure-devops-node-api/WorkItemTrackingApi");
const CodeApi = require("azure-devops-node-api/CoreApi");
const WorkInterfaces = require("azure-devops-node-api/interfaces/WorkInterfaces");
const CoreInterfaces = require("azure-devops-node-api/interfaces/CoreInterfaces");

Dotenv.config();
const orgUrl = process.env.ORG;
const project = process.env.PROJECT;
const pat = process.env.PAT;

const authHandler = Azdev.getPersonalAccessTokenHandler(pat);
const connection = new Azdev.WebApi(orgUrl, authHandler);
const workApiPromise = connection.getWorkItemTrackingApi();

async function createWI(type, title, team, createdDate) {
    const wiJson = [ 
                    { "op": "add", "path": "/fields/System.Title", "value": title}, 
                    { "op": "add", "path": "/fields/MyCompany.Team", "value": team},
                    { "op": "add", "path": "/fields/System.CreatedDate", "value": new Date(createdDate)},
                    { "op": "add", "path": "/fields/System.RevisedDate", "value": new Date(createdDate)},
                    { "op": "add", "path": "/fields/System.ChangedDate", "value": new Date(createdDate)}
                   ];
    const workApi = await workApiPromise;
    const wi = await workApi.createWorkItem(null, wiJson, project, type, false, true);
    return wi;
}

const workItemCreationSpec = [
    {
        type: "Bug",
        team: "India",
        trend: [
            { date: "02/12/2020", count: 30},
            { date: "02/14/2020", count: 40},
            { date: "02/18/2020", count: 50},
            { date: "02/23/2020", count: 20},
            { date: "02/25/2020", count: 10},
            { date: "02/28/2020", count: 5},
            { date: "02/29/2020", count: 0},
            { date: "02/12/2020", count: 14}
        ]
    }
];

async function createWorkItems() {
    for (const spec of workItemCreationSpec) {
        const type = spec.type;
        const team = spec.team;
        for (const item of spec.trend) {
            const count = item.count;
            for (let i = 0; i < count; i++) {
                const title = `${type}-${new Date(item.date).toDateString()}-${i+1}`;
                const wi = await createWI(type, title, team, item.date);
                console.log(`Created woritem with id:${wi.id} and title:${wi.title}`);
            }
        }
    }
}

createWorkItems();




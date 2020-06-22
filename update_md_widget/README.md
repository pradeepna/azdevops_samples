### How to run

1. Clone this repo
1. Install nodejs and npm if not already installed
1. `cd update_md_widget`
1. `npm install`
1. [Create PAT](https://docs.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate?view=azure-devops&tabs=preview-page) for the Azure DevOps Account
1. Create a file called .env in the folder with the following entry:

   `PAT = <pat created in above step>`
1. Create a file by name "newMarkdown.md" in the folder (if it already does not exist) and replace it with the markdown content to overwrite
1. `node update_md_widget.js -o <org_url> -p <project_name> -t <team_name> -d <dashboard_id> -w <substring_in_first_line_of_md_widget>`
1. Eg: `node .\update_md_widget.js -o https://dev.azure.com/pradeepbhat -p LearnCD -t "LearnCD Team" -d 1fd3a69d-6b5d-43cb-a852-c573aaf9386d -w Context`
### How to install
```
> npm install
```

### How to run

Set environment variable PAT to your personal access token for the org. See this [document](https://docs.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate?view=azure-devops&tabs=preview-page) for how to generate personal access token or PAT. 

```
> node copy_dashboard.js <options>
```


### Example
```
> node copy_dashboard.js -o https://pradeepbhat.visualstudio.com -s "Samples" --st "Samples Team" -d "Personal" --dt "Personal Team" -i ea18e130-934d-4120-86c6-3685faf38783
```

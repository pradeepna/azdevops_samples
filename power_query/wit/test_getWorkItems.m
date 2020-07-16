let
    
    scenarios = OData.Feed("https://analytics.dev.azure.com/mseng/AzureDevOps/_odata/v3.0/WorkItems?$filter=WorkItemType eq 'Scenario' and state ne 'In Progress'&$select=WorkItemId,Title", null, [Implementation="2.0",OmitValues = ODataOmitValues.Nulls,ODataVersion = 4]),
    workItemIds = scenarios[WorkItemId],

    // Need to define the URL and the function to fetch contents this way to ensure that scheduled refresh works on Power BI service. 
    // The static analyzer on Power BI needs to understand the data source that is being used in order to support refresh. 
    url = "https://dev.azure.com/mseng",
    projectName = "AzureDevOps",
    contents = (o) => VSTS.AccountContents(url, o),
    descriptions = Func_GetWorkItems(contents, url, projectName, workItemIds, {"System.Description"}),
    joinedTable = Table.Join(scenarios, "WorkItemId", descriptions, "id")
in
    joinedTable

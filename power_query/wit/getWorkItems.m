(contents as function, url as text, projectName as text, workItemIds as list, fields as list) => 

let

    GetWorkItemsBatch = (workItemIdsBatch as list) => 
        let
            body = [ ids = workItemIdsBatch, fields = fields, errorPolicy = "omit" ],
            bodyAsJson = Json.FromValue(body),
            options = [ 
                        RelativePath = projectName & "/_apis/wit/workitemsbatch?api-version=5.1",
                        Content = bodyAsJson, 
                        Headers = [#"Content-type" = "application/json", #"Accept" = "application/json"  ]
                       ],
            records = Json.Document(contents(options)),
            workItemsList = records[value]
        in 
            workItemsList,

    workItemIdBatches = List.Split(workItemIds, 200),
    
    responses = List.Generate(
        () => [i = -1, response={}],
        each [i] < List.Count(workItemIdBatches),
        each [
            i=[i]+1,
            response = GetWorkItemsBatch(workItemIdBatches{i})
        ],
        each [response]
    ),

    combinedResponses = List.Combine(responses),

    responseAsTable = Table.FromList(combinedResponses, Splitter.SplitByNothing(), null, null, ExtraValues.Error),

    expandedColumns = Table.ExpandRecordColumn(responseAsTable, "Column1", {"id", "fields"}, {"id", "fields"}),

    expandedFieldColumns = Table.ExpandRecordColumn(expandedColumns, "fields", fields, fields)

in
    expandedFieldColumns

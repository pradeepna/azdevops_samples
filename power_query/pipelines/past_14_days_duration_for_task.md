## Duration percentiles for past 14 days

```
let
   CurrentDate = DateTime.Date(DateTimeZone.LocalNow()),
   Ago = Date.AddDays(CurrentDate, -14),
   AgoText = Date.ToText(Ago, "yyyy-MM-dd") & "Z ",
   Source = OData.Feed ("https://analytics.dev.azure.com/org/project/_odata/v3.0-preview/PipelineRunActivityResults?"
        &"$apply=filter( "
                &"Pipeline/PipelineName eq 'My pipeline' "
                &"and TaskDisplayName eq 'My task' "
                &"and PipelineRunCompletedOn/Date ge "& AgoText 
        &"and (PipelineRunOutcome eq 'Succeed' or PipelineRunOutcome eq 'PartiallySucceeded') "
        &"and (CanceledCount ne 1 and SkippedCount ne 1 and AbandonedCount ne 1) "
            &"    ) "
                &"/compute( "
                &"percentile_cont(ActivityDurationSeconds, 0.8, PipelineRunCompletedDateSK) as TaskDuration80thPercentileInSeconds) "
            &"/groupby( "
                &"(TaskDuration80thPercentileInSeconds, PipelineRunCompletedOn/Date)) "
            &"&$orderby=PipelineRunCompletedOn/Date asc "
    ,null, [Implementation="2.0",OmitValues = ODataOmitValues.Nulls,ODataVersion = 4]),
    #"Expanded PipelineRunCompletedOn" = Table.ExpandRecordColumn(Source, "PipelineRunCompletedOn", {"Date"}, {"PipelineRunCompletedOn.Date"}) 
in
    #"Expanded PipelineRunCompletedOn"
```

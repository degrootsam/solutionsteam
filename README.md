# Solutions Team
Any steps created by the Solutions team within Betty Blocks, which are not part of another repo.
For questions please contact Betty Blocks via the in-platform chat support or solutions@bettyblocks.com

### Calculate Average Or Sum
<!-- MK --> 
This function expects a collection of records and the property you'd like to use to calculate the avg/sum of.
If you have the following collection
```
[
  {
    "clientName": "Betty Blocks",
    "revenue": 200
  },
  {
    "clientName": "iManage",
    "revenue": 100
  }
]
```
You can type `revenue` as the property name to use that value.
The expected output will then be 300 (when sum) or 150 (when avg)
Note that if the collection does not have any records, this function will always return 0 and the property should always be available in the every record in the collection.

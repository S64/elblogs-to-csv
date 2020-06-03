# elblogs-to-csv

Convert AWS ELB logs to CSV.

## Usages

```sh
pwd
# /tmp/AWSLogs/xxxxxxxxxxxx/elasticloadbalancing/xx-xxxxxxxxx-x
aws s3 cp s3://xxxxxxxx/AWSLogs/xxxxxxxxxxxx/elasticloadbalancing/xx-xxxxxxxxx-x . --recursive
elblogs-to-csv extract
elblogs-to-csv convert
elblogs-to-csv concat > /tmp/concat-logs.csv
```

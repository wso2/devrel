
curl -X POST -H "Content-Type: application/json" -d @resources/query_result.json <http://localhost:9090/fuel/prices>

curl "http://localhost:9090/prices?year=2000&size=10"

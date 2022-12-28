package main

import (
	"log"
	"os"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/cloudwatchlogs"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

var svc *cloudwatchlogs.CloudWatchLogs

type CloudwatchQuery struct {
	LogGroupName string `form:"logGroupName"`
	LogGroupNames []string `form:"logGroupNames"`
	Query string `form:"query" binding:"required"`
}

type CloudwatchQueryResultsInput struct {
	QueryId string `form:"queryId" binding:"required"`
}

func StartQuerySingle(logGroupName string, queryString string) (string, error) {
	return StartQuery([]string{logGroupName}, queryString)
}

func StartQuery(logGroupNames []string, queryString string) (string, error) {
	resp, err := svc.StartQuery(&cloudwatchlogs.StartQueryInput{
		StartTime: aws.Int64(time.Date(2019, 1, 1, 1, 1, 1, 1, time.UTC).Unix()),
		EndTime: aws.Int64(time.Now().Unix()),
		LogGroupNames: aws.StringSlice(logGroupNames),
		QueryString: aws.String(queryString),
	})
	if err != nil {
		return "", err
	}

	return *resp.QueryId, nil
}

func GetQueryResults(queryId *string) (*cloudwatchlogs.GetQueryResultsOutput, error) {
	resp2, err := svc.GetQueryResults(&cloudwatchlogs.GetQueryResultsInput{
		QueryId: queryId,
	})
	if err != nil {
		return nil, err
	}

	return resp2, nil
}

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Could not load .env file, using environment")
	}
	
	endpoint := os.Getenv("AWS_ENDPOINT")
	sess := session.Must(session.NewSession(&aws.Config{
		Endpoint: &endpoint,
	}))

	svc = cloudwatchlogs.New(sess)

	r := gin.Default()

	corsConfig := cors.DefaultConfig()
	corsConfig.AllowAllOrigins = true

	r.Use(cors.New(corsConfig))

	r.Use(static.Serve("/", static.LocalFile("./build", true)))
	
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})

	r.POST("/query", func(c *gin.Context) {
		var queryInput CloudwatchQuery
		if c.ShouldBind(&queryInput) == nil {
			var queryId string
			var err error
			if (queryInput.LogGroupName != "") {
				queryId, err = StartQuerySingle(queryInput.LogGroupName, queryInput.Query)
			} else {
				queryId, err = StartQuery(queryInput.LogGroupNames, queryInput.Query)
			}
			if err != nil {
				// TODO: If endpoint could not be reacted, return 500
				// If user made an error with their query, return 400
				log.Println(err)
				c.JSON(400, gin.H{
					"status": "error",
					"message": err.Error(),
				})
				return
			}
			c.JSON(200, gin.H{
				"status": "success",
				"data": gin.H{
					"queryId": queryId,
				},
			})
		}
	})

	r.POST("/results", func(c *gin.Context) {
		var queryResultsInput CloudwatchQueryResultsInput
		if c.ShouldBind(&queryResultsInput) == nil {
			result, err := GetQueryResults(&queryResultsInput.QueryId)
			if err != nil {
				log.Println(err)
				c.JSON(400, gin.H{
					"status": "error",
					"message": err.Error(),
				})
				return
			}
			c.JSON(200, gin.H{
				"status": "success",
				"data": gin.H{
					"queryStatus": result.Status,
					"queryResults": result.Results,
				},
			})
		}
	})

	r.Run()
}
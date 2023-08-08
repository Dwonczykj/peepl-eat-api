#!/bin/zsh

vegiDir="config"
localDir="/Users/joey/Github_Keep/vegi-backend-jd/$vegiDir"
localName="local.js"
awsConfig="aws.json"
remoteDir="/home/ubuntu/peepl-eat-api/$vegiDir"
local="$localDir/$localName"
sharedResourcesDir="/Users/joey/Github_Keep/shared_resources/secrets"
firebaseConfig="we-are-vegi-app-firebase-adminsdk-69yvy-26ba373cd9.json"


prod=ec2-54-235-19-123
QA=ec2-54-162-132-10
# QA=ec2-3-95-65-212
serverIP=$QA

cp $local $sharedResourcesDir

scp -i ~/.ssh/vegi-server-keyvaluepair.pem "$sharedResourcesDir/$localName" ubuntu@$serverIP.compute-1.amazonaws.com:$remoteDir

scp -i ~/.ssh/vegi-server-keyvaluepair.pem "$sharedResourcesDir/$awsConfig" ubuntu@$serverIP.compute-1.amazonaws.com:$remoteDir

scp -i ~/.ssh/vegi-server-keyvaluepair.pem "$sharedResourcesDir/$firebaseConfig" ubuntu@$serverIP.compute-1.amazonaws.com:$remoteDir
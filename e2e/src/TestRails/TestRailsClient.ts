import { browser } from 'protractor';

export class TestRailsClient {

    public TestRail = require("testrail-promise");    
    public TestRailsObject;
    public TestRailsInstance;


    constructor(){
        this.Initialize();
    }

    async Initialize(){
        this.TestRailsInstance = await this.GetTestrailsValues();
        this.TestRailsObject = new this.TestRail(this.TestRailsInstance.server, this.TestRailsInstance.userName, this.TestRailsInstance.passWord);
        this.TestRailsObject.allowUntrustedCertificate();
    }

    async GetProjects() {
        return this.TestRailsObject.getProjects()
        .then(function(projects) { console.log(projects); })
        .catch(function(err) { console.log("Error:", err) });
    }

    async CloseTestRunById(runId){
        return await this.TestRailsObject.closeRun({"run_id": runId})
        .then(function(response)
        {
            return response;
        })
        .catch(function (err)
        {
            console.log('Error while getting TestRun ' + err);
        });
    }

    async GetTestResultsByRunId(runId){
        return await this.TestRailsObject.getRun({"run_id": runId})
        .then(function(response)
        {
            return response;
        })
        .catch(function (err)
        {
            console.log('Error while getting TestRun ' + err);
        });
    }

    async AddTestResults(testRunId, testCaseId, statusId, errorMessage){
        return await this.TestRailsObject.addResultForCase({"run_id": testRunId, "case_id": testCaseId, "status_id": statusId,"comment": errorMessage, "version": "2.0", "elapsed": "1s", "defects": "", "assignedto_id": 7})
        .then(function(response)
        {
           return response;           
        })
        .catch(function (err)
         {
            console.log('Error while adding test run: ' + err);
        });
    }

    async GetTestRunId(){
        var trRunId = await browser.getProcessedConfig().then(function(config){return config.testRails;}).then(function(values){ return values.testRunId});
        return trRunId;
    }

    async CreateTestRun(){
        var testCases = [];    
        var testsFromApi = await this.TestRailsObject.getCases({"project_id": this.TestRailsInstance.projectId, "suite_id": this.TestRailsInstance.suiteId, "section_id" : this.TestRailsInstance.sectionId})
        .then(function(tests) 
        {
            return tests;
        })
        .catch(function(err) 
        {
            console.log('Error :', err)
        });
        testsFromApi.forEach(function (test) {
            testCases.push(test.id);
        });
        return await this.TestRailsObject.addRun({"project_id": this.TestRailsInstance.projectId, "suite_id": this.TestRailsInstance.suiteId,"name": "Automated Test Execution Prod ", "description": "Test run created using TestRails API V2", "case_ids": testCases, "include_all": false})
        .then(function(response)
        {
            return response.id;
        })
        .catch(function (err)
         {
            console.log('Error while adding test run: ' + err);
        });
    }

    async GetTestCases(){
        return await this.TestRailsObject.getCases({"project_id": this.TestRailsInstance.projectId, "suite_id": this.TestRailsInstance.suiteId, "section_id" : this.TestRailsInstance.sectionId})
        .then(function(tests) 
        {
            console.log(tests);
            return tests;
        })
        .catch(function(err) 
        {
            console.log('Error :', err)
        });
    }


    async GetTestrailsValues(){
        var trServer = await browser.getProcessedConfig().then(function(config){return config.testRails;}).then(function(values){ return values.baseUrl});
        var trUser = await browser.getProcessedConfig().then(function(config){return config.testRails;}).then(function(values){ return values.userName});
        var trPassWord = await browser.getProcessedConfig().then(function(config){return config.testRails;}).then(function(values){ return values.passWord});
        var trRunId = await browser.getProcessedConfig().then(function(config){return config.testRails;}).then(function(values){ return values.testRunId});
        var trProjectId = await browser.getProcessedConfig().then(function(config){return config.testRails;}).then(function(values){ return values.projectId});
        var trSuiteId = await browser.getProcessedConfig().then(function(config){return config.testRails;}).then(function(values){ return values.suiteId});
        var trSectionId = await browser.getProcessedConfig().then(function(config){return config.testRails;}).then(function(values){ return values.sectionId});
        var trUseTestRails = await browser.getProcessedConfig().then(function(config){return config.testRails;}).then(function(values){ return values.useTestRails});
        return{
            server: trServer,
            userName: trUser,
            passWord: trPassWord,
            testRunId: trRunId,
            projectId: trProjectId,
            suiteId: trSuiteId,
            sectionId: trSectionId,
            useTestRails: trUseTestRails
        };
    }

}
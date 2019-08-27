
import {db as db}  from '../config.json';
//import { OsNotificationService } from '../../src/app/services/os-notification.service';

export class DBUtils {

    public sql = require('mssql');
    public config;

    constructor(){//private osNotificationService : OsNotificationService){
        
    }

    //UTILS 
    async GetConfigValues(){
        return{
            server: db.server,
            database: db.database,
            user: db.username,
            password: db.password,
            port: parseInt(db.port) 
        };
    }

    async ExecuteQuery(dbQuery) {
        try {
            this.config = await this.GetConfigValues();
            let pool = await this.sql.connect(this.config);
            let result = await pool.request().query(dbQuery);                
            //console.log(result); //-->uncomment for debugging 
            this.sql.close();
            return result;
        } catch (err) {
            console.log(err);
            //this.osNotificationService.display(err);
        }
        return;
    }

    //USER 

    async getUserInfo(email){

        let query = `select * from ultrascrapper.Users where email = '${email}';`;
        let result = await this.ExecuteQuery(query);
        let user = {
                "Id": result.recordset[0]['Id'],
                "Email":result.recordset[0]["Email"], 
                "CurrentMonthRequests":result.recordset[0]["CurrentMonthRequests"],
                "BTCAddress":result.recordset[0]["BTCAddress"],
                "Password":result.recordset[0]["Password"]
            }
        
        return user;
    }

    async getUserStatistics(userId){
        let query = `EXEC [UmbrellaDB_QA].[test].[get_CurrentBalance] @UserId='${userId}';`;
        let result = await this.ExecuteQuery(query);
        return result.recordset[0];
    }

    async updateUser(userEmail, column, value){
        let query = `UPDATE ultrascrapper.users SET ${column} = '${value}' WHERE email = '${userEmail}';`;
        let response = await this.ExecuteQuery(query);
        return response
    }

    async updateUserBTCAdress(userEmail, NewBTCAdress){
        let query = `UPDATE ultrascrapper.users SET BTCAddress = '${NewBTCAdress}' WHERE email = '${userEmail}';`;
        let response = await this.ExecuteQuery(query);
        return response
    }


    async updateUserPassword(userEmail, password){
        let query = `update ultrascrapper.users set Password = '${password}' where email = '${userEmail}'`;
        let response = await this.ExecuteQuery(query);
        return response
    }

//REFERALS

    async removeReferrals(referredEmails){
        var users = '';
        for(var x =0; x < referredEmails.length; ++x){
            var user = await this.getUserInfo(referredEmails[x]);
            users += user;
            if (x < (referredEmails.length -1) ){
                users += ',';
            }
        }
        var query = 'Update ultrascrapper.Users set RefererId = 1 where Id in('+ users+ ');';
        var result = await this.ExecuteQuery(query);
        return result;
    }

    async getReferrals(id){
        let query = 'SELECT * FROM ultrascrapper.Users where RefererId = '+ id + ';';
        let referals = await this.ExecuteQuery(query);
        let result = [];
        for(var x =0; x < referals.recordset.length; ++x){
            result.push({
                "Email":referals.recordset[x]["Email"], 
                "CurrentMonthRequests":referals.recordset[x]["CurrentMonthRequests"],
                "BTCAddress":referals.recordset[x]["BTCAddress"]
            })
        }
        return result;
    }

    async addReferrals(ultraEmail, referredEmails){
        var users = '';
        var userId = await this.getUserInfo(ultraEmail);
        for(var x =0; x < referredEmails.length; ++x){
            var user = await this.getUserInfo(referredEmails[x]);
            users += user;
            if (x < (referredEmails.length -1) ){
                users += ',';
            }
        }
        var query = 'Update ultrascrapper.users set RefererId = '+ userId +' where Id in('+ users+ ');';
        var result = await this.ExecuteQuery(query);
        return result;
    }

    async editReferals(email, creationDate, currentMonthRequests ){
        var userId = await this.getUserInfo(email);
        var query = `Update ultrascrapper.users set CreationDate = \'`+ creationDate + `\', CurrentMonthRequests = ` + currentMonthRequests +` where Id = `+ userId +`;`;
        var result = await this.ExecuteQuery(query);
    }

//NOTIFICATIONS
    async removeNotifications(){
        var query = `Delete from ultrascrapper.notifications;`
        var result = await this.ExecuteQuery(query);
        return result;
    }

    async addNotifications(notifications){
        let query ='';
        for(var x =0; x < notifications.length; x ++){
            query = `Insert into ultrascrapper.notifications (Message, StartDate, EndDate) values ('`+ notifications[x].message +`', `+ notifications[x].startDate + `, `+ notifications[x].endDate +`);`;
            await this.ExecuteQuery(query);
        }
    }

    async getNotifications(){
        var query = `Select * from ultrascrapper.notifications where StartDate <= GetDate() and EndDate > GetDate() order by StartDate asc;`;
        var response = await this.ExecuteQuery(query);
        return response.recordset;
    }

}

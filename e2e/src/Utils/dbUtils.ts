import { browser } from 'protractor';
import { parse } from 'semver';
import { OsNotificationService } from '../../../src/app/services/os-notification.service';

export class DBUtils {

    public sql = require('mssql');
    public config;

    constructor(private osNotificationService : OsNotificationService){
        
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
            this.osNotificationService.display(err);
        }
        return;
    }

    async addTransactions(email){
        var userId = await this.getUltraUser(email);
        if (userId != null){
            var deleteQuery = `delete from ultra.Transactions where IdUser = ${userId};`
            var result = await this.ExecuteQuery(deleteQuery);
            var insertQuery = `insert into ultra.Transactions(CreationDate, Amount, ProfilesExtracted, IdUser) values(getDate(), 1.27,1270, ${userId});`
            result = await this.ExecuteQuery(insertQuery);
            return result;
        }else{
            console.log('UserId was not found with the email provided' + email);
            this.osNotificationService.display('UserId was not found with the email provided' + email);
        }
    }

    async removeTransactions(email){
        var userId = await this.getUltraUser(email);
        if (userId != null){
            var deleteQuery = `delete from ultra.Transactions where IdUser = ${userId};`
            var result = await this.ExecuteQuery(deleteQuery);
            return result;
        } else{
            console.log('UserId was not found with the email provided' + email);
            this.osNotificationService.display('UserId was not found with the email provided' + email);
        }
    }

    async getUltraUser(email){
        var query = `select Id from ultra.Users where email = '${email}';`;
        var result = await this.ExecuteQuery(query);
        return result.recordset[0]['Id'];
    }

    async removeReferrals(referredEmails){
        var users = '';
        for(var x =0; x < referredEmails.length; ++x){
            var user = await this.getUltraUser(referredEmails[x]);
            users += user;
            if (x < (referredEmails.length -1) ){
                users += ',';
            }
        }
        var query = 'Update ultra.users set RefererId = 1 where Id in('+ users+ ');';
        var result = await this.ExecuteQuery(query);
        return result;
    }

    async addReferrals(ultraEmail, referredEmails){
        var users = '';
        var userId = await this.getUltraUser(ultraEmail);
        for(var x =0; x < referredEmails.length; ++x){
            var user = await this.getUltraUser(referredEmails[x]);
            users += user;
            if (x < (referredEmails.length -1) ){
                users += ',';
            }
        }
        var query = 'Update ultra.users set RefererId = '+ userId +' where Id in('+ users+ ');';
        var result = await this.ExecuteQuery(query);
        return result;
    }

    async editReferals(email, creationDate, currentMonthRequests ){
        var userId = await this.getUltraUser(email);
        var query = `Update ultra.users set CreationDate = \'`+ creationDate + `\', CurrentMonthRequests = ` + currentMonthRequests +` where Id = `+ userId +`;`;
        var result = await this.ExecuteQuery(query);
    }

    async removeNotifications(){
        var query = `Delete from ultra.notifications;`
        var result = await this.ExecuteQuery(query);
        return result;
    }

    async addNotifications(notifications){
        var query ='';
        for(var x =0; x < notifications.length; x ++){
            query = `Insert into ultra.notifications (Message, StartDate, EndDate) values ('`+ notifications[x].message +`', `+ notifications[x].startDate + `, `+ notifications[x].endDate +`)`;        
            await this.ExecuteQuery(query);
        }
    }

    async getNotifications(){
        var query = `Select Message, StartDate from ultra.notifications where StartDate <= GetDate() and EndDate > GetDate() order by StartDate desc;`;
        var response = await this.ExecuteQuery(query);
        return response;
    }

    async updateUltraPaypalAccount(paypalEmail, userEmail){
        var ultraUserId = await this.getUltraUser(userEmail);
        var query = `update ultra.users set PaypalEmail = '${paypalEmail}' where Id = ${ultraUserId};`;
        await this.ExecuteQuery(query);
    }

    async updateUltraPassword(password, userEmail){
        var ultraUserId = await this.getUltraUser(userEmail);
        var query = `update ultra.users set Password = '${password}' where Id = ${ultraUserId};`;
        await this.ExecuteQuery(query);
    }

    async getUltraUserInfo(userEmail, column){
        var ultraUserId = await this.getUltraUser(userEmail);
        var query = `Select ${column} from ultra.users where Id = ${ultraUserId};`;
        var result = await this.ExecuteQuery(query);
        return result.recordset[0][column];    
    }

    async GetConfigValues(){
        var dbServer = await browser.getProcessedConfig().then(function(config){return config.databaseValues;}).then(function(values){ return values.server}).catch(function(err) { console.log('Error obtained ', err); this.osNotificationService.display('Error obtained '+ err);});
        var dbDatabase = await browser.getProcessedConfig().then(function(config){return config.databaseValues;}).then(function(values){ return values.database}).catch(function(err) { console.log('Error obtained ', err); this.osNotificationService.display('Error obtained '+ err);});
        var dbUser = await browser.getProcessedConfig().then(function(config){return config.databaseValues;}).then(function(values){ return values.user}).catch(function(err) { console.log('Error obtained ', err); this.osNotificationService.display('Error obtained '+ err);});
        var dbPassword = await browser.getProcessedConfig().then(function(config){return config.databaseValues;}).then(function(values){ return values.password}).catch(function(err) { console.log('Error obtained ', err); this.osNotificationService.display('Error obtained '+ err);});
        var dbPort = await browser.getProcessedConfig().then(function(config){return config.databaseValues;}).then(function(values){ return values.portId}).catch(function(err) { console.log('Error obtained ', err); this.osNotificationService.display('Error obtained '+ err);});
        return{
            server: dbServer,
            database: dbDatabase,
            user: dbUser,
            password: dbPassword,
            port: parseInt(dbPort)
        };
    }
}
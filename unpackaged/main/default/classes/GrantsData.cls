public class GrantsData {

    public static final Id PersonAccountRTId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Person Account').getRecordTypeId();
    public static final Id BizAccountRTId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Business Account').getRecordTypeId();

    public static final List<List<String>> allAccountFields = new List<List<String>>();
    public static final List<List<String>> allBudgetFields = new List<List<String>>();
    public static final List<List<String>> allFundingOppFields = new List<List<String>>();
    public static final List<List<String>> allIndAppFields = new List<List<String>>();
    public static final List<List<String>> allFundAwardFields = new List<List<String>>();
    public static final List<List<String>> allFundDispFields = new List<List<String>>();
    public static final List<List<String>> allFundAwardReqFields = new List<List<String>>();

    public static void prepareData() {
        allAccountFields.add(new List<String> {'Grantwood City Council','','','Customer - Direct','Government','','','970-555-9633','','','','','','445 North Peak Road','Grantwood','Colorado','80522','United States','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','False'});
        allAccountFields.add(new List<String> {'Takagawa Institute','','','Customer - Direct','Not For Profit','','','602-555-3542','','','','','','9833 Plateau Street','Phoenix','Arizona','85310','United States','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','False'});
        allAccountFields.add(new List<String> {'Grantseeker Community: Self-Registered','','','','','','','','','','','','','','','','','','','','','','','Account initially assigned to self-registered users for the Grantseeker Community','','','','','','','','','','','','','','','','','','','','','','','','False'});
        allAccountFields.add(new List<String> {'Hillside Elementary','','','Customer - Direct','Education','','','719-555-9914','','','','','','713 S. 8th Street','Englewood','Colorado','80110','United States','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','False'});
        allAccountFields.add(new List<String> {'STEPS','','','Customer - Direct','Not For Profit','','','303-555-7541','','','','','','2920 Juniper Drive','Denver','Colorado','80230','United States','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','False'});
        allAccountFields.add(new List<String> {'','','','Customer - Direct','Other','','','719-555-4157','','','','','','31 Greenrose Drive Unit 7','PuebloPueblo','Colorado','81006','United States','','','','','','','Ms.','Rylee','Hood','Student','rylee.hood@echigh.example.com','','','','','','','','','31 Greenrose Drive Unit 7','Pueblo','Colorado','81006','United States','','','','','','True'});
        allAccountFields.add(new List<String> {'','','','Customer - Direct','Other','','','719-555-5117','','','','','','27 NW Overlook Road','Colorado Springs','Colorado','80907','United States','','','','','','','Ms.','Alanna','Preston','Student','alanna.preston@freenet.example.com','','','','','','','','','27 NW Overlook Road','Colorado Springs','Colorado','80907','United States','','','','','','True'});
        allAccountFields.add(new List<String> {'','','','Customer - Direct','Other','','','719-555-8020','','','','','','8591 W Rockville Street','Salida','Colorado','81201','United States','','','','','','','Ms.','Mina','Charmchi','Student','mina.charmchi@pchs.example.com','','','','','','','','','8591 W Rockville Street','Salida','Colorado','81201','United States','','','','','','True'});
        allAccountFields.add(new List<String> {'','','','Customer - Direct','Other','','','719-555-3725','','','','','','98 53rd Ave','Canon City','Colorado','81212','United States','','','','','','','Ms.','Ling','Xiang','Student','ling.xiang@freenet.example.com','','','','','','','','','98 53rd Ave','Canon City','Colorado','81212','United States','','','','','','True'});
        allAccountFields.add(new List<String> {'','','','Customer - Direct','Other','','','303-555-3044','','','','','','519 West Cherry Street','Denver','Colorado','80227','United States','','','','','','','Mr.','Anson','Henderson','Student','anson.henderson@connect.example.com','','','','','','','','','519 West Cherry Street','Denver','Colorado','80227','United States','','','','','','True'});
        allAccountFields.add(new List<String> {'','','','Customer - Direct','Other','','','303-555-5711','','','','','','261 North Arrowhead Ave','Denver','Colorado','80216','United States','','','','','','','Mr.','Corey','Valdez','Student','corey.valdez@connect.example.com','','','','','','','','','261 North Arrowhead Ave','Denver','Colorado','80216','United States','','','','','','True'});
        allAccountFields.add(new List<String> {'','','','Customer - Direct','Other','','','720-555-4601','','','','','','2920 Juniper Drive','Denver','Colorado','Colorado','United States','','','','','','','Mr.','Itoro','Idowu','Student','itoro.idowu@cstate.example.com','','','','','','','','','2920 Juniper Drive','Denver','Colorado','Colorado','United States','','','','','','True'});
        allAccountFields.add(new List<String> {'','','','Customer - Direct','Other','','','303-555-7541','','','','','','2920 Juniper Drive','Denver','Colorado','Colorado','United States','','','','','','','Ms.','Ellen','Perez','Program Coordinator','ellen.perez@steps.example.com','','','','','','','','','2920 Juniper Drive','Denver','Colorado','Colorado','United States','','','','','','True'});
        allAccountFields.add(new List<String> {'','','','Customer - Direct','Other','','','303-555-7540','','','','','','2920 Juniper Drive','Denver','Colorado','Colorado','United States','','','','','','','Ms.','Grace','Walker','Development Director','grace.walker@steps.example.com','','','','','','','','','2920 Juniper Drive','Denver','Colorado','Colorado','United States','','','','','','True'});
        allAccountFields.add(new List<String> {'','','','Customer - Direct','Other','','','303-555-7540','','','','','','713 S. 8th Street','Denver','Colorado','Colorado','United States','','','','','','','Mr.','Jermaine','Harmon','Intern','jermaine.harmon@steps.example.com','','','','','','','','','713 S. 8th Street','Denver','Colorado','Colorado','United States','','','','','','True'});
        allAccountFields.add(new List<String> {'','','','Customer - Direct','Other','','','719-555-9914','','','','','','9834 Plateau Street','Denver','Colorado','Colorado','United States','','','','','','','Mr.','Devon','Berger','Literary Coach','devon.berger@hillside-elementary.example.com','','','','','','','','','9834 Plateau Street','Denver','Colorado','Colorado','United States','','','','','','True'});
        allAccountFields.add(new List<String> {'','','','Customer - Direct','Other','','','602-555-3543','','','','','','9833 Plateau Street','Denver','Colorado','Colorado','United States','','','','','','','Ms.','Adriana','Atterberry','Grants Manager','adriana.atterberry@takagawa-institute.example.com','','','','','','','','','9833 Plateau Street','Denver','Colorado','Colorado','United States','','','','','','True'});
        allAccountFields.add(new List<String> {'','','','Customer - Direct','Other','','','602-555-3542','','','','','','701 Magnolia Street Apt 402','Denver','Colorado','Colorado','United States','','','','','','','Dr.','Meiko','Takagawa','Executive Director','meiko.takagawa@takagawa-institute.example.com','','','','','','','','','9833 Plateau Street','Denver','Colorado','Colorado','United States','','','','','','True'});
        allAccountFields.add(new List<String> {'','','','Customer - Direct','Other','','','719-555-2417','','','','','','445 North Peak Road','Denver','Colorado','Colorado','United States','','','','','','','Mr.','Dillon','Whitaker','Assitant City Manager','dillon.whitaker@gwcity.example.com','','','','','','','','','701 Magnolia Street Apt 402','Denver','Colorado','Colorado','United States','','','','','','True'});

        allBudgetFields.add(new List<String> {'Skills for Success','15000.0','','','','','','Active','Project',''});
        allBudgetFields.add(new List<String> {'Standard Grant Budget Template','','','','','','','Planned','Project',''});
        allBudgetFields.add(new List<String> {'Skills for Success 2023-2024','46000.0','','','','','','Planned','Project',''});

        allFundingOppFields.add(new List<String> {'Kumar Endowment Scholarship','The Kumar family graciously sponsors the Kumar Endowment Scholarship Fund for high school students who have made a positive impact in their local community. This fund awards $2,000 scholarships every 4 years to ten students seeking higher education. Eligible expenses include tuition, room and board, fees, and books during the academic year.','In progress','200000.0'});
        allFundingOppFields.add(new List<String> {'Education','','In progress',''});
        allFundingOppFields.add(new List<String> {'Community Impact','','In progress','500000.0'});
        allFundingOppFields.add(new List<String> {'Relief and Reinvestment Grant','The Relief and Reinvestment Grant provides financial assistance in the form of grants to small businesses experiencing temporary revenue loss due to unforeseen circumstances, such as a natural disaster or economic crisis. Grants of up to $10,000 are awarded to select small businesses to help offset lost revenue. This fund can be used for: Rent and utilities, Payroll, Outstanding debt, Technology upgrades, Immediate operation costs','In progress','300000.0'});

        allIndAppFields.add(new List<String> {'Kumar Scholarship Fund Application: Rylee Hood','2022-12-20 00:00:00','Grant Application','8000.0','','In Progress','1','6','1'});
        allIndAppFields.add(new List<String> {'Kumar Endowment Scholarship: Alanna Preston','2020-11-18 00:00:00','Grant Application','8000.0','','Approved','2','7','1'});
        allIndAppFields.add(new List<String> {'Skills for Success','2022-12-09 00:00:00','Grant Application','46000.0','Skills for Success addresses an existing gap for at-risk women seeking to learn technical and soft skills to help them find gainful employment in the community. Participants of the program receive: Vouchers for free community college courses on select topics, such as bookkeeping, computer literacy, and communication skills. Help developing a resume and interview preparation. One-on-one mentoring with a female business owner in the community. Ongoing support from the STEPS staff.','In Progress','9','5','3'});
        allIndAppFields.add(new List<String> {'Grantwood City Food Bank','2021-02-21 00:00:00','Grant Application','','Grantwood City Food Bank','In Progress','','12',''});
        allIndAppFields.add(new List<String> {'Grantwood City Food Bank','2021-02-21 00:00:00','Grant Application','100000.0','Grantwood City Food Bank','In Progress','14','1','3'});
        allIndAppFields.add(new List<String> {'Kumar Endowment Scholarship: Mina Charmchi','2022-11-09 00:00:00','Grant Application','8000.0','','In Review','3','8','1'});
        allIndAppFields.add(new List<String> {'Kumar Endowment Scholarship: Ling Xiang','2022-11-11 00:00:00','Grant Application','8000.0','','Submitted','4','9','1'});
        allIndAppFields.add(new List<String> {'Kumar Endowment Scholarship: Anson Henderson','2021-11-02 00:00:00','Grant Application','8000.0','','Denied','5','10','1'});
        allIndAppFields.add(new List<String> {'Kumar Endowment Scholarship: Corey Valdez','2022-11-28 00:00:00','Grant Application','8000.0','','Submitted','6','11','1'});
        allIndAppFields.add(new List<String> {'Kumar Endowment Scholarship: Itoro Idowu','2018-10-23 00:00:00','Grant Application','8000.0','','Approved','7','12','1'});
        allIndAppFields.add(new List<String> {'Takagawa Institute: Relief and Reinvestment Grant','2022-09-19 00:00:00','Grant Application','10000.0','','Approved','13','2','4'});
        allIndAppFields.add(new List<String> {'Eager Beavers Read!','2021-11-02 00:00:00','Grant Application','15000.0','Eager Beavers Read! is an after school program that helps foster a love of reading in our 1st - 5th grade classes and also provides a safe place for students to go between 3:00 pm and 4:30 pm. Younger children will be paired up with an older student to help expand their early literacy skills, while older students work to develop mentoring skills and confidence.','Approved','11','4','2'});
        allIndAppFields.add(new List<String> {'Eager Beavers Read! (Multi Stage Application)','2021-11-02 00:00:00','Grant Application','15000.0','Eager Beavers Read! is an after school program that helps foster a love of reading in our 1st - 5th grade classes and also provides a safe place for students to go between 3:00 pm and 4:30 pm. Younger children will be paired up with an older student to help expand their early literacy skills, while older students work to develop mentoring skills and confidence.','In Progress','11','4','2'});
        allIndAppFields.add(new List<String> {'STEPS to Leadership','2022-08-26 00:00:00','Grant Application','28000.0','STEPS to Leadership is a proposed program that came from requests for additional leadership training for our graduates from Skills for Success, a successful program we currently offer to at-risk women in the community. After completing Skills for Success, graduates can learn leadership skills through various trainings, seminars, and one-on-one mentoring that will help prepare these future female leaders.','Submitted','8','5','3'});
        allIndAppFields.add(new List<String> {'Skills for Success','2021-09-28 00:00:00','Grant Application','40000.0','Skills for Success addresses an existing gap for at-risk women seeking to learn technical and soft skills to help them find gainful employment in the community. Participants of the program receive: Vouchers for free community college courses on select topics, such as bookkeeping, computer literacy, and communication skills. Help developing a resume and interview preparation. One-on-one mentoring with a female business owner in the community. Ongoing support from the STEPS staff.','Approved','9','5','3'});

        allFundAwardFields.add(new List<String> {'Kumar Endowment Scholarship: Itoro Idowu','8000.0','2019-01-28 00:00:00','Completed','2022-11-08 00:00:00','2019-02-22 00:00:00','7','12','1','10'});
        allFundAwardFields.add(new List<String> {'Takagawa Institute: Relief and Reinvestment Grant','10000.0','2022-10-06 00:00:00','Completed','2023-10-05 00:00:00','2022-10-06 00:00:00','13','2','4','11'});
        allFundAwardFields.add(new List<String> {'Eager Beavers Read!','15000.0','2022-01-16 00:00:00','Active','2025-02-20 00:00:00','2022-02-21 00:00:00','11','4','','12'});
        allFundAwardFields.add(new List<String> {'Skills for Success','40000.0','2021-11-21 00:00:00','Active','2022-12-08 00:00:00','2021-12-08 00:00:00','9','5','3','3'});
        allFundAwardFields.add(new List<String> {'Kumar Endowment Scholarship: Alanna Preston','8000.0','2021-02-07 00:00:00','Active','2024-11-07 00:00:00','2021-02-21 00:00:00','2','7','1','2'});

        allFundDispFields.add(new List<String> {'2000.0','2021-02-21 00:00:00','EFT','2021-02-21 00:00:00','Paid','5'});
        allFundDispFields.add(new List<String> {'2000.0','2022-02-21 00:00:00','EFT','2022-02-21 00:00:00','Paid','5'});
        allFundDispFields.add(new List<String> {'2000.0','2023-02-22 00:00:00','EFT','2023-02-22 00:00:00','Paid','5'});
        allFundDispFields.add(new List<String> {'2000.0','','EFT','2024-02-22 00:00:00','Scheduled','5'});
        allFundDispFields.add(new List<String> {'2000.0','2019-02-22 00:00:00','EFT','2019-02-22 00:00:00','Paid','1'});
        allFundDispFields.add(new List<String> {'2000.0','2020-02-22 00:00:00','EFT','2020-02-22 00:00:00','Paid','1'});
        allFundDispFields.add(new List<String> {'2000.0','2021-02-21 00:00:00','EFT','2021-02-21 00:00:00','Paid','1'});
        allFundDispFields.add(new List<String> {'2000.0','2022-02-21 00:00:00','EFT','2022-02-21 00:00:00','Paid','1'});
        allFundDispFields.add(new List<String> {'10000.0','2022-10-06 00:00:00','EFT','2022-10-06 00:00:00','Paid','2'});
        allFundDispFields.add(new List<String> {'40000.0','2021-11-21 00:00:00','EFT','2021-11-21 00:00:00','Paid','4'});
        allFundDispFields.add(new List<String> {'5000.0','2022-01-16 00:00:00','EFT','2022-01-16 00:00:00','Paid','3'});
        allFundDispFields.add(new List<String> {'5000.0','2023-01-17 00:00:00','','2023-01-17 00:00:00','Paid','3'});
        allFundDispFields.add(new List<String> {'5000.0','','EFT','2024-01-17 00:00:00','Scheduled','3'});

        allFundAwardReqFields.add(new List<String> {'Application','2020-11-18 00:00:00','2021-01-21 00:00:00','<p>Application</p>','Accepted','Final Application','','5','2'});
        allFundAwardReqFields.add(new List<String> {'Letter of Recommendation','2020-11-18 00:00:00','2021-01-21 00:00:00','<p>Letter of Recommendation</p>','Accepted','Review','','5','2'});
        allFundAwardReqFields.add(new List<String> {'Application','2018-10-23 00:00:00','2019-01-22 00:00:00','<p>Application</p>','Accepted','Final Application','','1','7'});
        allFundAwardReqFields.add(new List<String> {'Letter of Recommendation','2018-11-05 00:00:00','2019-01-22 00:00:00','<p>Letter of Recommendation</p>','Accepted','Review','','1','7'});
        allFundAwardReqFields.add(new List<String> {'Budget Report','','2023-03-25 00:00:00','<p>Budget Report</p>','Open','Report','','2','13'});
        allFundAwardReqFields.add(new List<String> {'Outcome Report','','2023-10-09 00:00:00','<p>Outcome Report</p>','Open','Outcome','','2','13'});
        allFundAwardReqFields.add(new List<String> {'Application','2022-09-19 00:00:00','2023-07-10 00:00:00','<p>Application</p>','Accepted','Final Application','','2','13'});
        allFundAwardReqFields.add(new List<String> {'Application','2021-09-28 00:00:00','2022-07-09 00:00:00','<p><span style="font-family: Arial; font-size: 10pt; color: rgb(0, 0, 0);">Application</span></p>','Accepted','Final Application','','4','9'});
        allFundAwardReqFields.add(new List<String> {'Outcome Report','','2023-07-10 00:00:00','<p>Outcome Report</p>','Open','Outcome','','4','9'});
        allFundAwardReqFields.add(new List<String> {'Proposed Budget','2021-09-28 00:00:00','2022-07-09 00:00:00','<p>Proposed budget</p>','Accepted','Report','','4','9'});
        allFundAwardReqFields.add(new List<String> {'Budget Report','2022-08-21 00:00:00','2023-07-10 00:00:00','<p>Budget Report</p>','Complete','Report','','4','9'});
        allFundAwardReqFields.add(new List<String> {'Letter of Intent','2021-09-28 00:00:00','2022-07-09 00:00:00','<p><span style="font-family: Arial; font-size: 10pt; color: rgb(0, 0, 0);">Cover letter</span></p>','Accepted','Letter of Intent','','4','9'});
        allFundAwardReqFields.add(new List<String> {'Letter of Intent','2021-11-02 00:00:00','2022-07-09 00:00:00','<p><span style="font-family: Arial; font-size: 10pt; color: rgb(0, 0, 0);">Cover letter</span></p>','Accepted','Letter of Intent','','3','11'});
        allFundAwardReqFields.add(new List<String> {'Application','2021-11-020 0:00:00','2022-07-09 00:00:00','<p><span style="font-family: Arial; font-size: 10pt; color: rgb(0, 0, 0);">Application</span></p>','Accepted','Final Application','','3','11'});
        allFundAwardReqFields.add(new List<String> {'Outcome Report','','2025-07-09 00:00:00','<p>Outcome Report</p>','Open','Outcome','','3','11'});
        allFundAwardReqFields.add(new List<String> {'Budget Report','','2024-07-09 00:00:00','<p><span style="color: rgb(0, 0, 0); font-size: 10pt; font-family: Arial;">Budget Report</span></p>','Open','Report','','3','11'});
    }

    public static void cleanupData() {
        prepareData();
        Set<String> bizAccountNames = new Set<String>();
        Set<String> personAccountFirstNames = new Set<String>();
        Set<String> personAccountLastNames = new Set<String>();
        Set<String> budgetNames = new Set<String>();
        Set<String> fundingOppNames = new Set<String>();
        Set<String> indieAppNames = new Set<String>();
        Set<String> fundingAwardNames = new Set<String>();

        for(List<String> accountFields: allAccountFields) {
            if(accountFields[0] != '') {
                bizAccountNames.add(accountFields[0]);
            } else {
                personAccountFirstNames.add(accountFields[25]);
                personAccountLastNames.add(accountFields[26]);
            }
        }

        for(List<String> budgetFields: allBudgetFields) {
            budgetNames.add(budgetFields[0]);
        }

        for(List<String> fundingOppFields: allFundingOppFields) {
            fundingOppNames.add(fundingOppFields[0]);
        }

        for(List<String> indieAppFields: allIndAppFields) {
            indieAppNames.add(indieAppFields[0]);
        }

        for(List<String> fundAwardFields: allFundAwardFields) {
            fundingAwardNames.add(fundAwardFields[0]);
        }

        List<FundingAward> fundAwards = [SELECT Id FROM FundingAward WHERE Name =: fundingAwardNames];
        List<IndividualApplication> indieApps = [SELECT Id FROM IndividualApplication WHERE ApplicationName =: indieAppNames];
        List<FundingOpportunity> fundOpps = [SELECT Id FROM FundingOpportunity WHERE Name =: fundingOppNames];
        List<Budget> budgets = [SELECT Id FROM Budget WHERE Name =: budgetNames];
        List<Account> bizAccounts = [SELECT Id FROM Account WHERE Name =: bizAccountNames];
        List<Account> personAccounts = [SELECT Id FROM Account WHERE FirstName =: personAccountFirstNames AND LastName =: personAccountLastNames];

        Database.delete(fundAwards, false);
        Database.delete(indieApps, false);
        Database.delete(fundOpps, false);
        Database.delete(budgets, false);
        Database.delete(bizAccounts, false);
        Database.delete(personAccounts, false);
    }

    public static void addData(Boolean cleanupData) {
        prepareData();

        List<FundingOpportunity> fundingOpps = new List<FundingOpportunity>();
        for(List<String> fundingOppFields: allFundingOppFields) {
            FundingOpportunity fundOpp = new FundingOpportunity(
                Name = fundingOppFields[0],
                Description = fundingOppFields[1],
                Status = fundingOppFields[2],
                MaximumFundingAmount = parseDecimal(fundingOppFields[3])
            );
            fundingOpps.add(fundOpp);
        }
        insert fundingOpps;

        List<Budget> budgets = new List<Budget>();
        for(List<String> budgetFields: allBudgetFields) {
            Budget aBudget = new Budget(
                Name = budgetFields[0],
                Amount = parseDecimal(budgetFields[1]),
                Description = budgetFields[2], 
                PeriodEndDate = parseDate(budgetFields[3]), 
                PeriodName = budgetFields[4],
                PeriodStartDate = parseDate(budgetFields[5]),
                Quantity = parseInt(budgetFields[6]), 
                Status = budgetFields[7], 
                Type = budgetFields[8]
            );
            budgets.add(aBudget);
        }
        insert budgets;

        List<Account> accts = new List<Account>();
        for(List<String> acctFields: allAccountFields) {
            Boolean isPersonAccount = Boolean.valueOf(acctFields[47]);
            if(isPersonAccount) {
                Account acct = new Account(
                    Type = acctFields[3],
                    Industry = acctFields[4],
                    Phone = acctFields[7],
                    Fax = acctFields[8],
                    Website = acctFields[9],
                    Description = acctFields[23], 
                    Salutation = acctFields[24], 
                    FirstName = acctFields[25], 
                    LastName = acctFields[26], 
                    PersonTitle = acctFields[27], 
                    PersonEmail = acctFields[28], 
                    PersonDepartment = acctFields[29], 
                    PersonBirthdate = parseDate(acctFields[30]), 
                    PersonLeadSource = acctFields[31], 
                    PersonHomePhone = acctFields[32], 
                    PersonMobilePhone = acctFields[33], 
                    PersonOtherPhone = acctFields[34], 
                    PersonAssistantName = acctFields[35], 
                    PersonAssistantPhone = acctFields[36], 
                    PersonMailingStreet = acctFields[37], 
                    PersonMailingCity = acctFields[38], 
                    PersonMailingState = acctFields[39], 
                    PersonMailingPostalCode = acctFields[40], 
                    PersonMailingCountry = acctFields[41], 
                    PersonOtherStreet = acctFields[42], 
                    PersonOtherCity = acctFields[43], 
                    PersonOtherState = acctFields[44], 
                    PersonOtherPostalCode = acctFields[45], 
                    PersonOtherCountry = acctFields[46],
                    RecordTypeId = PersonAccountRTId
                );
                accts.add(acct);
            } else { 
                Account acct = new Account(
                    Name = acctFields[0],
                    Type = acctFields[3],
                    Industry = acctFields[4],
                    Phone = acctFields[7],
                    Fax = acctFields[8],
                    Website = acctFields[9],
                    BillingStreet = acctFields[13],
                    BillingCity = acctFields[14],
                    BillingState = acctFields[15],
                    BillingPostalCode = acctFields[16],
                    BillingCountry = acctFields[17],
                    ShippingStreet = acctFields[18], 
                    ShippingCity = acctFields[19], 
                    ShippingState = acctFields[20], 
                    ShippingPostalCode = acctFields[21], 
                    ShippingCountry = acctFields[22], 
                    Description = acctFields[23],
                    RecordTypeId = BizAccountRTId
                );
                accts.add(acct);
            }
        }

        insert accts;
        Set<Id> acctIds = new Set<Id>();
        for(Account acct: accts) {
            acctIds.add(acct.Id);
        }

        // is insert order preserved? Probably not guaranteed. But we will pretend!
        Map<Id, Account> personAcctsById = new Map<Id, Account>([SELECT Id, FirstName, LastName, PersonContactId FROM Account WHERE Id =: acctIds AND PersonContactId != null]);
        List<Account> personAccts = personAcctsById.values();

        List<IndividualApplication> indApps = new List<IndividualApplication>();
        for(List<String> indAppFields: allIndAppFields) {
            IndividualApplication indApp = new IndividualApplication(
                ApplicationName = indAppFields[0], 
                AppliedDate = parseDateTime(indAppFields[1]),
                Category = indAppFields[2],
                RequestedAmount = parseDecimal(indAppFields[3]), 
                FundingRequestPurpose = indAppFields[4], 
                Status = indAppFields[5], 
                ContactId = getContactIdFromAccounts(personAccts, indAppFields[6]), 
                AccountId = getRecordId(accts, indAppFields[7]),
                FundingOpportunityId = getRecordId(fundingOpps,indAppFields[8])
            );
            indApps.add(indApp);
        }
        insert indApps;

        List<FundingAward> fundAwards = new List<FundingAward>();
        for(List<String> fundAwardFields: allFundAwardFields) {
            FundingAward fundAward = new FundingAward(
                Name = fundAwardFields[0], 
                Amount = parseDecimal(fundAwardFields[1]), 
                DecisionDate = parseDateTime(fundAwardFields[2]), 
                Status = fundAwardFields[3], 
                EndDate = parseDateTime(fundAwardFields[4]), 
                StartDate = parseDateTime(fundAwardFields[5]),  
                ContactId = getContactIdFromAccounts(personAccts,fundAwardFields[6]), 
                AwardeeId = getRecordId(accts, fundAwardFields[7]),
                FundingOpportunityId = getRecordId(fundingOpps,fundAwardFields[8]),
                IndividualApplicationId = getRecordId(indApps,fundAwardFields[9])
            );
            fundAwards.add(fundAward);
        }
        insert fundAwards;

        List<FundingDisbursement> fundDisps = new List<FundingDisbursement>();
        for(List<String> fundDispFields: allFundDispFields) {
            FundingDisbursement fundDisp = new FundingDisbursement(
                Amount = parseDecimal(fundDispFields[0]),
                DisbursementDate = parseDateTime(fundDispFields[1]), 
                PaymentMethodType = fundDispFields[2], 
                ScheduledDate = parseDateTime(fundDispFields[3]), 
                Status = fundDispFields[4], 
                FundingAwardId = getRecordId(fundAwards,fundDispFields[5])
            );
            fundDisps.add(fundDisp);
        }
        insert fundDisps;

        List<FundingAwardRequirement> fundAwardReqs = new List<FundingAwardRequirement>();
        for(List<String> fundAwardReqFields: allFundAwardReqFields) {
            FundingAwardRequirement far = new FundingAwardRequirement(
                Name = fundAwardReqFields[0], 
                SubmittedDate = parseDateTime(fundAwardReqFields[1]),
                DueDate = parseDateTime(fundAwardReqFields[2]), 
                Description = fundAwardReqFields[3],
                Status = fundAwardReqFields[4],
                Type = fundAwardReqFields[5], 
                FundingDisbursementId = getRecordId(fundDisps,fundAwardReqFields[6]),
                FundingAwardId = getRecordId(fundAwards, fundAwardReqFields[7]),
                AssignedContactId = getContactIdFromAccounts(personAccts, fundAwardReqFields[8])
            );
            fundAwardReqs.add(far);
        }
        insert fundAwardReqs;

        if(cleanupData) {
            Database.delete(budgets, false);
            Database.delete(accts, false);
            Database.delete(fundingOpps, false);
            Database.delete(indApps, false);
            Database.delete(fundAwards, false);
            Database.delete(fundDisps, false);
        }
    }

    private static Id getContactIdFromAccounts(List<Account> accts, String indexAsString) {
        try {
            return indexAsString != '' ? accts.get(Integer.valueOf(indexAsString)-1).PersonContactId : null;
        } catch (Exception e) {
            System.debug(' ****** '+e.getStackTraceString());
            return null;
        }
    }

    private static Id getRecordId(List<SObject> sobjs, String indexAsString) {
        try {
            return indexAsString != '' ? sobjs.get(Integer.valueOf(indexAsString)-1).Id : null;
        } catch (Exception e) {
            System.debug(' ****** '+e.getStackTraceString());
            return null;
        }
    }

    private static DateTime parseDateTime(String token) {
        return token != '' ? DateTime.valueOf(token) : null;
    }

    private static Date parseDate(String token) {
        return token != '' ? Date.valueOf(token) : null;
    }

    private static Decimal parseDecimal(String token) {
        return token != '' ? Decimal.valueOf(token) : null;
    }

    private static Integer parseInt(String token) {
        return token != '' ? Integer.valueOf(token) : null;
    }    
}
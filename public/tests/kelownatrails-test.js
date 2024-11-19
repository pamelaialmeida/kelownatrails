const { Builder, Browser, By, until } = require('selenium-webdriver');
const { describe, it } = require('mocha');
const { expect } = require('chai');
const { faker } = require('@faker-js/faker');

describe("Kelowna trails tests", function() {
    let baseUrl; 
    switch(process.env.ENV) {
        case 'test':
            baseUrl = process.env.TEST_URL; 
            break;
        case 'staging': 
            baseUrl = process.env.STAGING_URL; 
            break; 
        case 'production': 
            baseUrl = process.env.PRODUCTION_URL; 
            break; 
        default: 
            throw new Error('Invalid environment specified');
    }
    

    let driver;

    before(async function() {
        driver = await new Builder().forBrowser("chrome").build();
    });

    beforeEach(async function () {
       await driver.get(baseURL); 
    });

    it("Should not add Member when no data is provided", async function() {
        await driver.findElement(By.id("addMemberBtn")).click();
        let alert = await driver.wait(until.alertIsPresent());
        let message = await alert.getText();
        expect(message).to.be.equal("Please first enter a group member's name");

        await alert.accept();
    });

    it("Should not add member when no group size is provided", async function() {
        let lastName = faker.person.lastName();
        let firstName = faker.person.firstName();

        await driver.findElement(By.id("lastname")).sendKeys(lastName);
        await driver.findElement(By.id("firstname")).sendKeys(firstName);

        await driver.findElement(By.id("addMemberBtn")).click();

        let alert = await driver.wait(until.alertIsPresent());
        let message = await alert.getText();
        expect(message).to.be.equal("Size must be greater than 0");

        await alert.accept();
    });

    it("Should add a member to the list", async function() {
        let lastName = faker.person.lastName();
        let firstName = faker.person.firstName();
        
        await driver.findElement(By.id("lastname")).sendKeys(lastName);
        await driver.findElement(By.id("firstname")).sendKeys(firstName);
        let groupSize = await driver.findElement(By.id("GroupSize"));
        groupSize.clear();
        groupSize.sendKeys("2");
        
        await driver.findElement(By.id("addMemberBtn")).click();

        await driver.manage().setTimeouts({ implicit: 10000 });

        let options = await driver.findElements(By.css('#members option'));

        let optionTexts = await Promise.all(options.map(async (option) => { 
            return await option.getText(); 
        })); 

        let addedMember = `${lastName}, ${firstName}`;

        expect(optionTexts).to.include(addedMember, `The member "${addedMember}" is not added to the list of members.`);
    });

});



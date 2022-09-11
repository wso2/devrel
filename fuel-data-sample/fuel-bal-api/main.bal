
import ballerina/io;
import ballerina/file;
import ballerina/lang.value;
import ballerina/regex;
import ballerina/time;

const FuelFileName = "resources/PET_PRI_GND_DCUS_NUS_W - Data 1.csv";

type Fuel record {
    readonly int ymd;
    time:Date date;
    record {
        float diesel;
        float premium;
        float midgrade;
        float regular;
    } price;
};

type CsvFuel record {
    string DATE; //Week end-date
    string EMM_EPMRU_PTE_NUS_DPG; //Weekly U.S. Regular Conventional Retail Gasoline Prices  (Dollars per Gallon)
    string EMM_EPMM_PTE_NUS_DPG; //Weekly U.S. Midgrade All Formulations Retail Gasoline Prices  (Dollars per Gallon)
    string EMM_EPMP_PTE_NUS_DPG; //Weekly U.S. Premium All Formulations Retail Gasoline Prices  (Dollars per Gallon)
    string EMD_EPD2D_PTE_NUS_DPG; //Weekly U.S. No 2 Diesel Retail Prices  (Dollars per Gallon)
};

public function main() returns error? {

    boolean fileExists = check file:test(FuelFileName, file:READABLE);
    if (fileExists) {
        string[][] content = check io:fileReadCsv(FuelFileName);
        string[] header = content.shift();
        io:println("Header", header.toString());
        table<Fuel> key(ymd) fuelTable = table [];

        foreach var fuelData in content {
            map<string> formatted = {};
            if fuelData.length() >= 14 {
                foreach var [i, f] in fuelData.enumerate() {
                    formatted[header[i]] = f;
                }
                json j = check value:fromJsonString(formatted.toJsonString());
                CsvFuel cf = check j.cloneWithType(CsvFuel);

                time:Date|error date = dateFromEmailString(cf.DATE);
                if date is error {
                    continue;
                } else {
                    float|error diesel = float:fromString(cf.EMD_EPD2D_PTE_NUS_DPG);
                    float|error premium = float:fromString(cf.EMM_EPMP_PTE_NUS_DPG);
                    float|error midgrade = float:fromString(cf.EMM_EPMM_PTE_NUS_DPG);
                    float|error regular = float:fromString(cf.EMM_EPMRU_PTE_NUS_DPG);
                    int|error yearMonthDay = int:fromString(intToString(date.year, 4) + intToString(date.month, 2) + intToString(date.day, 2));

                    fuelTable.put({
                        ymd: yearMonthDay is error ? 0 : yearMonthDay,
                        date: date,
                        price: {
                            diesel: diesel is error ? 0 : diesel,
                            premium: premium is error ? 0 : premium,
                            midgrade: midgrade is error ? 0 : midgrade,
                            regular: regular is error ? 0 : regular
                        }
                    });
                }
            }
        }

        Fuel[] prices = from Fuel fuel in fuelTable
            where fuel.ymd >= 20200601
            limit 1
            select fuel;

        io:println("Data", prices);
    }
}

string[] MONTHS = ["", "jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

function dateFromEmailString(string dateString) returns time:Date|error {
    string[] pieces = regex:split(dateString, " ");
    string month = pieces[0];
    string day = regex:replace(pieces[1], ",", "");
    string year = pieces[2];
    time:Date date = {
        year: check int:fromString(year),
        month: MONTHS.indexOf(month.toLowerAscii(), 1) ?: 0,
        day: check int:fromString(day)
    };

    return date;
}

function intToString(int n, int precision) returns string {
    string s = n.toString();
    while s.length() < precision {
        s = "0" + s;
    }
    return s;
}

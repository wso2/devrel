
import ballerina/io;
import ballerina/file;
import ballerina/lang.value;
import ballerina/regex;
import ballerina/time;
import ballerina/http;

const FuelFileName = "resources/PET_PRI_GND_DCUS_NUS_W - Data 1.csv";

type FuelPrices record {
    readonly int ymd;
    time:Date date;
    record {
        float diesel;
        float premium;
        float midgrade;
        float regular;
    } grade;
};

table<FuelPrices> key(ymd) FuelTable = table [];

public function main() returns error? {
    check parseFile();

    FuelPrices[] prices = from FuelPrices fuel in FuelTable
        where fuel.ymd >= 20200601
        limit 1
        select fuel;

    io:println("Data", prices);
}

configurable int port = 8080;

service /fuel on new http:Listener(port) {
    resource function get prices(int? year, int? month, int? day, int? size) returns FuelPrices[]|http:BadRequest {
        int|error dateQuery = int:fromString(intToString(year ?: 0, 4) + intToString(month ?: 0, 2) + intToString(day ?: 0, 2));
        if dateQuery is error {
            return http:BAD_REQUEST;
        }

        FuelPrices[] prices = from FuelPrices fuel in FuelTable
            where fuel.ymd >= dateQuery
            limit size ?: 1
            select fuel;

        return prices;
    }

    resource function get prices/[int ymd]() returns FuelPrices|http:NotFound {
        FuelPrices? price = FuelTable[ymd];
        if price is () {
            return http:NOT_FOUND;
        } else {
            return price;
        }
    }
}

type CsvFuel record {
    string DATE; //Week end-date
    string EMM_EPMRU_PTE_NUS_DPG; //Weekly U.S. Regular Conventional Retail Gasoline Prices  (Dollars per Gallon)
    string EMM_EPMM_PTE_NUS_DPG; //Weekly U.S. Midgrade All Formulations Retail Gasoline Prices  (Dollars per Gallon)
    string EMM_EPMP_PTE_NUS_DPG; //Weekly U.S. Premium All Formulations Retail Gasoline Prices  (Dollars per Gallon)
    string EMD_EPD2D_PTE_NUS_DPG; //Weekly U.S. No 2 Diesel Retail Prices  (Dollars per Gallon)
};

function parseFile() returns error? {
    boolean fileExists = check file:test(FuelFileName, file:READABLE);
    if (fileExists) {
        string[][] content = check io:fileReadCsv(FuelFileName);
        string[] header = content.shift();

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

                    FuelTable.put({
                        ymd: yearMonthDay is error ? 0 : yearMonthDay,
                        date: date,
                        grade: {
                            diesel: diesel is error ? 0 : diesel,
                            premium: premium is error ? 0 : premium,
                            midgrade: midgrade is error ? 0 : midgrade,
                            regular: regular is error ? 0 : regular
                        }
                    });
                }
            }
        }
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

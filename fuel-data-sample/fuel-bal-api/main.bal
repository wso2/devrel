
import ballerina/io;
import ballerina/file;
import ballerina/lang.value;
import ballerina/regex;
import ballerina/time;
import ballerina/http;

# Fuel prices record
#
# + ymd - Integer key representing 4 digit Year, 2 digit Month, 2 digit Day
# + date - Parse date object
# + grade - prices by fuel grade
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

# Fuel price storage table
table<FuelPrices> key(ymd) FuelTable = table [];

configurable int port = 9090;

service /fuel on new http:Listener(port) {

    # Fetch an array of prices based on a date
    #
    # + year - Year
    # + month - Month
    # + day - Day
    # + size - the number of items to return, default: 1
    # + return - and array of FuelPrices
    resource function get prices(int? year, int? month, int? day, int? size) returns FuelPrices[]|http:BadRequest {
        int|error dateQuery = creatYMDKey(year, month, day);
        if dateQuery is error {
            return http:BAD_REQUEST;
        }

        FuelPrices[] prices = from FuelPrices fuel in FuelTable
            where fuel.ymd >= dateQuery
            limit size ?: 1
            select fuel;

        return prices;
    }

    # Fetch one FuelPrice based on the key
    #
    # + ymd - Year, month, day key. ex: 19990101
    # + return - single FuelPrices object
    resource function get prices/[int ymd]() returns FuelPrices|http:NotFound {
        FuelPrices? price = FuelTable[ymd];
        if price is () {
            return http:NOT_FOUND;
        } else {
            return price;
        }
    }

    # Pupulates the FuelTable with posted FuelPrices data
    #
    # + prices - An array of FuelPrice objects to pun in the FuelTable
    # + return - HTTP OK 200
    resource function post prices(@http:Payload FuelPrices[] prices) returns http:Ok {
        prices.forEach((p) => FuelTable.put(p));
        return http:OK;
    }
}

# Creates a standar year month day date number allowing for correct sorting and lookups
#
# + year - 4 digit Year
# + month - 2 digit Month
# + day - 2 digit Day
# + return - hexadecimal string representation of int value
function creatYMDKey(int? year, int? month, int? day) returns int|error {
    return check int:fromString(intToString(year ?: 0, 4) + intToString(month ?: 0, 2) + intToString(day ?: 0, 2));
}

# Adds leading 0s to an int string based on the precision
#
# + n - int to be converted to a string
# + precision - how many total digits should return
# + return - hexadecimal string representation of int value
function intToString(int n, int precision) returns string {
    string s = n.toString();
    while s.length() < precision {
        s = "0" + s;
    }
    return s;
}

configurable string FuelFileName = "resources/PET_PRI_GND_DCUS_NUS_W - Data 1.csv";

public function main() returns error? {

    // First the FuelFile needs to be parsed and loading into a table
    check parseFuelCsv(FuelFileName);

    // Test for data in the FuelTable and panic if none is found
    FuelPrices[] testPrices = from FuelPrices fuel in FuelTable
        limit 1
        select fuel;
    if testPrices.length() == 0 {
        panic error("Fuel data table is emplty");
    }
}

# A record for the CSV fields neccesary for this service
#
# + DATE - Week end-date
# + EMM_EPMRU_PTE_NUS_DPG - Weekly U.S. Regular Conventional Retail Gasoline Prices  (Dollars per Gallon)
# + EMM_EPMM_PTE_NUS_DPG - Weekly U.S. Midgrade All Formulations Retail Gasoline Prices  (Dollars per Gallon)
# + EMM_EPMP_PTE_NUS_DPG - Weekly U.S. Premium All Formulations Retail Gasoline Prices  (Dollars per Gallon)
# + EMD_EPD2D_PTE_NUS_DPG - Weekly U.S. No 2 Diesel Retail Prices  (Dollars per Gallon)
type CsvFuel record {
    string DATE;
    string EMM_EPMRU_PTE_NUS_DPG;
    string EMM_EPMM_PTE_NUS_DPG;
    string EMM_EPMP_PTE_NUS_DPG;
    string EMD_EPD2D_PTE_NUS_DPG;
};

# Parses a fuel price csv file 
#
# + fileName - name of the csv file
# + return - optional error if parse fails
function parseFuelCsv(string fileName) returns error? {

    // Check for the file to exist
    boolean fileExists = check file:test(fileName, file:READABLE);
    if (fileExists) {

        // Parse the CSV into a Matrix and pull the first array as the Header
        string[][] content = check io:fileReadCsv(fileName);
        string[] header = content.shift();

        foreach var fuelData in content {
            map<string> fuelMap = {};
            if fuelData.length() >= 14 { // This check is needed due to the csv file read only capturing up to the last full cell.

                // The Header array is used as the keys to map each record line as the values
                foreach var [i, f] in fuelData.enumerate() {
                    fuelMap[header[i]] = f;
                }

                // Convert the map to json and parse the json to the CsvFuel record
                json j = check value:fromJsonString(fuelMap.toJsonString());
                CsvFuel cf = check j.cloneWithType(CsvFuel);

                // The date will be our key and must be parsed correctly or we will skip the record
                time:Date|error date = dateFromString(cf.DATE);
                if date is error {
                    continue;
                } else {

                    // Convert CSV string values to standard types
                    float|error diesel = float:fromString(cf.EMD_EPD2D_PTE_NUS_DPG);
                    float|error premium = float:fromString(cf.EMM_EPMP_PTE_NUS_DPG);
                    float|error midgrade = float:fromString(cf.EMM_EPMM_PTE_NUS_DPG);
                    float|error regular = float:fromString(cf.EMM_EPMRU_PTE_NUS_DPG);
                    int|error yearMonthDay = creatYMDKey(date.year, date.month, date.day);

                    // Put new record into the Fuel table. Use 0 in place of an error
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

# Parses a date string
#
# + dateString - ex: Jan, 3, 2000
# + return - time:Date value
function dateFromString(string dateString) returns time:Date|error {
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



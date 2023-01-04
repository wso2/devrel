/**
 * Copyright (c) 2022, WSO2 LLC. (http://www.wso2.com).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { useAuthContext } from "@asgardeo/auth-react";
import { FormEvent, ReactElement, useMemo, useState } from "react";
import { FaHubspot, FaSalesforce } from "react-icons/fa";
import { VscSourceControl, VscSymbolProperty } from "react-icons/vsc";
import {
    MdSentimentVerySatisfied,
    MdSentimentSatisfied,
    MdSentimentNeutral,
    MdSentimentDissatisfied,
    MdCircle
} from "react-icons/md";
import {
    HiOutlineNewspaper,
    HiOutlineViewGridAdd,
    HiOutlineTrendingUp,
    HiOutlineStar,
    HiOutlineLink,
    HiOutlineOfficeBuilding,
    HiOutlineUser,
    HiOutlineSearch,
    HiOutlineExternalLink,
    HiOutlineAnnotation
} from "react-icons/hi";
import {
    SiFacebook,
    SiTwitter,
    SiLinkedin,
    SiGithub,
    SiCrunchbase
} from "react-icons/si";
import Layout from "../../components/Layout";
import Loader from "../../components/Loader";
import { Prospect360Response } from "./types";

const ProspectInfo = () => {
    const { state, httpRequest } = useAuthContext();
    const [userInfo, setUserInfo] = useState<Prospect360Response>();
    const [isUserInfoLoading, setIsUserInfoLoading] = useState<boolean>(false);
    const [isUserInfoError, setIsUserInfoError] = useState<boolean>();
    const [email, setEmail] = useState<string>();
    const [errorMessage, setErrorMessage] = useState<string>();

    const validateEmail = (email: string) => {
        // eslint-disable-next-line no-useless-escape
        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
            return true;
        } else {
            return false;
        }
    };

    const personalInfo = useMemo(() => {
        const person = userInfo?.clearbitData?.person;

        if (!person) {
            return null;
        }
        return {
            avatar: person.avatar,
            name: person.name.fullName,
            email: person.email,
            profession: person.employment.title,
            company: person.employment.name,
            location: person.geo
                ? person.geo.country + ` (${person.geo.countryCode})`
                : person.location,
            linkedin: person.linkedin?.handle,
            twitter: person.twitter?.handle,
            facebook: person.facebook?.handle,
            github: person.github?.handle
        };
    }, [userInfo]);

    const companyInfo = useMemo(() => {
        const company = userInfo?.clearbitData?.company;

        if (!company) {
            return null;
        }
        return {
            logo: company.logo,
            name: company.name,
            domain: company.domain,
            industry: company.category?.industry,
            revenue: company.metrics?.estimatedAnnualRevenue,
            employees: company.metrics?.employeesRange,
            linkedin: company.linkedin?.handle,
            twitter: company.twitter?.handle,
            crunchbase: company.crunchbase?.handle
        };
    }, [userInfo]);

    // hubspot data
    const hsData = useMemo(() => {
        const hubspotData = userInfo?.hubspotData?.properties;

        if (!hubspotData) {
            return null;
        }
        return {
            whitepaperDownloads: hubspotData.no_whitepaper_downloads
                ? hubspotData.no_whitepaper_downloads
                : 0,
            webinarRegistrations: hubspotData.no_webinar_registrations
                ? hubspotData.no_webinar_registrations
                : 0,
            stage: hubspotData.lifecyclestage,
            createdAt: new Date(hubspotData.createdate).toLocaleString(),
            modifiedAt: new Date(hubspotData.lastmodifieddate).toLocaleString(),
            interestedProducts: hubspotData.interested_products?.split(",")
        };
    }, [userInfo]);

    // salesforce data
    const sfData = useMemo(() => {
        const salesforceData = userInfo?.salesforceData;

        if (!salesforceData) {
            return null;
        }
        return {
            id: salesforceData.Id,
            fullName: salesforceData.FirstName + " " + salesforceData.LastName,
            sfStatus: salesforceData.Status,
            email: salesforceData.Email,
            leadSource: salesforceData.LeadSource,
            company: salesforceData.Company
        };
    }, [userInfo]);

    // servicenow data
    const snData = useMemo(() => {
        const account = userInfo?.serviceNowData?.serviceNowAccount;
        const cases = userInfo?.serviceNowData?.serviceNowCases;

        if (!account && !cases) {
            return;
        }

        let status = "";

        if (Object.keys(account).length !== 0) {
            const res = account.result;

            status = res.customer === "true" ? "Customer" : "";
        }

        return {
            status: status,
            cases: cases
        };
    }, [userInfo]);

    const retrieveUserInfo = async (e: FormEvent) => {
        e.preventDefault();

        if (!email) {
            setIsUserInfoError(true);
            setErrorMessage("Please enter prospect's email address.");
            return;
        }
        if (!validateEmail(email)) {
            setIsUserInfoError(true);
            setErrorMessage("Please enter a valid email address.");
            return;
        }
        try {
            setIsUserInfoLoading(true);
            setIsUserInfoError(false);
            const res = await httpRequest({
                url: `${process.env.REACT_APP_BASE_API_ENDPOINT}/hvwp/customer-360/1.0.0/customer-360view?email=${email}`
            });
            setUserInfo(res?.data);
            setIsUserInfoLoading(false);
        } catch (error: any) {
            setIsUserInfoLoading(false);
            setIsUserInfoError(true);
            setErrorMessage(error.message);
            // Temp fix when token gets expired
            // @ts-ignore
            if (error?.response?.status === 401) {
                // Temp fix when token gets expired
                sessionStorage.clear();
                window.location.reload();
            }
        }
    };

    const getSentimentIcon = (score: number): ReactElement => {
        if (score >= 75) {
            return (
                <MdSentimentVerySatisfied
                    className="text-green-400"
                    size={64}
                />
            );
        } else if (score >= 50) {
            return <MdSentimentSatisfied className="text-blue-400" size={64} />;
        } else if (score >= 25) {
            return <MdSentimentNeutral className="text-amber-400" size={64} />;
        } else
            return (
                <MdSentimentDissatisfied className="text-red-400" size={64} />
            );
    };

    return (
        <>
            {state.isAuthenticated && !state.isLoading ? (
                <Layout>
                    <div className="mt-3 mb-10 flex justify-start">
                        <form onSubmit={retrieveUserInfo} className="w-full">
                            <div className="form-control w-full">
                                <div className="input-group w-full">
                                    <input
                                        type="email"
                                        placeholder="Search via email"
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        disabled={isUserInfoLoading}
                                        required
                                        className="input input-bordered focus:border-primary focus:outline-none text-secondary-800 w-full"
                                    />
                                    <button
                                        type="submit"
                                        className="btn btn-square bg-primary border-primary"
                                        onClick={retrieveUserInfo}
                                        disabled={isUserInfoLoading}
                                    >
                                        <HiOutlineSearch size={24} />
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {isUserInfoLoading ? (
                        <div className="flex flex-col justify-center items-center top-1/2 right-[calc(50%-120px)] absolute space-y-4">
                            <div role="status">
                                <svg
                                    className="inline mr-2 w-16 h-16 text-gray-200 animate-spin dark:text-gray-600 fill-primary-500"
                                    viewBox="0 0 100 101"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                        fill="currentColor"
                                    />
                                    <path
                                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                        fill="currentFill"
                                    />
                                </svg>
                                <span className="sr-only">Loading...</span>
                            </div>
                            <div>Fetching data</div>
                        </div>
                    ) : isUserInfoError ? (
                        <div
                            className="bg-red-100 rounded-lg py-5 px-6 mb-3 text-base text-red-700 inline-flex items-center w-full"
                            role="alert"
                        >
                            <svg
                                aria-hidden="true"
                                focusable="false"
                                data-prefix="fas"
                                data-icon="times-circle"
                                className="w-4 h-4 mr-2 fill-current"
                                role="img"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 512 512"
                            >
                                <path
                                    fill="currentColor"
                                    d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm121.6 313.1c4.7 4.7 4.7 12.3 0 17L338 377.6c-4.7 4.7-12.3 4.7-17 0L256 312l-65.1 65.6c-4.7 4.7-12.3 4.7-17 0L134.4 338c-4.7-4.7-4.7-12.3 0-17l65.6-65-65.6-65.1c-4.7-4.7-4.7-12.3 0-17l39.6-39.6c4.7-4.7 12.3-4.7 17 0l65 65.7 65.1-65.6c4.7-4.7 12.3-4.7 17 0l39.6 39.6c4.7 4.7 4.7 12.3 0 17L312 256l65.6 65.1z"
                                ></path>
                            </svg>
                            {errorMessage
                                ? errorMessage
                                : "Error! Something went wrong."}
                        </div>
                    ) : userInfo ? (
                        <div>
                            <div className="stats mb-10 w-full shadow-xl bg-white text-secondary">
                                <div className="stat space-y-2">
                                    {userInfo?.sentimentScore ? (
                                        <div className="flex items-center space-x-4">
                                            <div>
                                                {getSentimentIcon(
                                                    userInfo?.sentimentScore
                                                )}
                                            </div>
                                            <div>
                                                <div
                                                    className={`stat-value text-6xl ${
                                                        userInfo?.sentimentScore >=
                                                        75
                                                            ? "text-green-500"
                                                            : userInfo?.sentimentScore >=
                                                              50
                                                            ? "text-blue-500"
                                                            : userInfo?.sentimentScore >=
                                                              25
                                                            ? "text-amber-500"
                                                            : "text-red-500"
                                                    }`}
                                                >
                                                    {userInfo?.sentimentScore}%
                                                </div>
                                                <div className="stat-title">
                                                    Overall Score
                                                </div>
                                            </div>
                                        </div>
                                    ) : null}
                                    <div className="flex flex-wrap gap-2">
                                        {hsData?.stage ? (
                                            <div className="flex justify-between items-center py-2 px-4 rounded-full text-slate-500 bg-orange-50 text-xs">
                                                <FaHubspot
                                                    className="text-orange-500 mr-2"
                                                    size={24}
                                                />
                                                Hubspot Stage:&nbsp;
                                                <span className="text-sm text-orange-800">
                                                    {hsData?.stage?.toUpperCase()}
                                                </span>
                                            </div>
                                        ) : null}
                                        {sfData?.sfStatus ? (
                                            <div className="flex justify-between items-center py-2 px-4 rounded-full text-slate-500 bg-cyan-50 text-xs">
                                                <FaSalesforce
                                                    className="text-cyan-500 mr-2"
                                                    size={24}
                                                />
                                                Salesforce Status:&nbsp;
                                                <span className="text-sm text-cyan-800">
                                                    {sfData?.sfStatus?.toUpperCase()}
                                                </span>
                                            </div>
                                        ) : null}
                                        {sfData?.leadSource ? (
                                            <div className="flex justify-between items-center py-2 px-4 rounded-full text-slate-500 bg-pink-50 text-xs">
                                                <VscSourceControl
                                                    className="text-pink-500 mr-2"
                                                    size={24}
                                                />
                                                Lead source:&nbsp;
                                                <span className="text-sm text-pink-800">
                                                    {sfData?.leadSource}
                                                </span>
                                            </div>
                                        ) : null}
                                        {snData?.status ? (
                                            <div className="flex justify-between items-center py-2 px-4 rounded-full text-slate-500 bg-green-50 text-xs">
                                                <VscSymbolProperty
                                                    className="text-green-500 mr-2"
                                                    size={24}
                                                />
                                                ServiceNow status:&nbsp;
                                                <span className="text-sm text-green-800">
                                                    {snData?.status}
                                                </span>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div className="card w-full shadow-xl bg-white text-secondary">
                                    <div className="card-body">
                                        <h2 className="card-title">
                                            <HiOutlineUser className="text-primary" />
                                            Prospect Information
                                        </h2>
                                        {personalInfo ? (
                                            <div className="overflow-x-auto">
                                                <table className="table w-full text-sm">
                                                    <tbody>
                                                        {personalInfo.avatar ? (
                                                            <tr>
                                                                <th></th>
                                                                <td>
                                                                    <img
                                                                        className="w-20 h-20 rounded-full"
                                                                        src={
                                                                            personalInfo.avatar
                                                                        }
                                                                        alt=""
                                                                    ></img>
                                                                </td>
                                                            </tr>
                                                        ) : null}
                                                        <tr>
                                                            <th>Name</th>
                                                            <td>
                                                                {personalInfo.name
                                                                    ? personalInfo.name
                                                                    : sfData?.fullName}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <th>Email</th>
                                                            <td>
                                                                {personalInfo.email
                                                                    ? personalInfo.email
                                                                    : sfData?.email}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <th>Title</th>
                                                            <td>
                                                                {
                                                                    personalInfo.profession
                                                                }
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <th>Company</th>
                                                            <td>
                                                                {personalInfo.company
                                                                    ? personalInfo.company
                                                                    : sfData?.company}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <th>Location</th>
                                                            <td>
                                                                {
                                                                    personalInfo.location
                                                                }
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                <div
                                                    tabIndex={0}
                                                    className="collapse collapse-arrow"
                                                >
                                                    <input type="checkbox" />
                                                    <div className="collapse-title text-lg font-medium flex items-center bg-light rounded-lg">
                                                        <HiOutlineLink className="mr-2 opacity-80 text-primary" />
                                                        Online Presence
                                                    </div>
                                                    <div className="collapse-content">
                                                        <table className="table w-full text-sm">
                                                            <tbody>
                                                                {personalInfo.linkedin ? (
                                                                    <tr>
                                                                        <th className="flex items-center">
                                                                            <SiLinkedin className="mr-2 text-primary opacity-50" />
                                                                            LinkedIn
                                                                        </th>
                                                                        <td>
                                                                            <a
                                                                                rel="noreferrer"
                                                                                target="_blank"
                                                                                href={`https://www.linkedin.com/${personalInfo.linkedin}`}
                                                                                className="text-sky-700 flex items-center"
                                                                            >
                                                                                linkedin.com/
                                                                                {
                                                                                    personalInfo.linkedin
                                                                                }
                                                                                <HiOutlineExternalLink className="ml-1" />
                                                                            </a>
                                                                        </td>
                                                                    </tr>
                                                                ) : null}
                                                                {personalInfo.twitter ? (
                                                                    <tr>
                                                                        <th className="flex items-center">
                                                                            <SiTwitter className="mr-2 text-primary opacity-50" />
                                                                            Twitter
                                                                        </th>
                                                                        <td>
                                                                            <a
                                                                                rel="noreferrer"
                                                                                target="_blank"
                                                                                href={`https://www.twitter.com/${personalInfo.twitter}`}
                                                                                className="text-sky-700 flex items-center"
                                                                            >
                                                                                twitter.com/
                                                                                {
                                                                                    personalInfo.twitter
                                                                                }
                                                                                <HiOutlineExternalLink className="ml-1" />
                                                                            </a>
                                                                        </td>
                                                                    </tr>
                                                                ) : null}
                                                                {personalInfo.facebook ? (
                                                                    <tr>
                                                                        <th className="flex items-center">
                                                                            <SiFacebook className="mr-2 text-primary opacity-50" />
                                                                            Facebook
                                                                        </th>
                                                                        <td>
                                                                            <a
                                                                                rel="noreferrer"
                                                                                target="_blank"
                                                                                href={`https://www.facebook.com/${personalInfo.facebook}`}
                                                                                className="text-sky-700 flex items-center"
                                                                            >
                                                                                facebook.com/
                                                                                {
                                                                                    personalInfo.facebook
                                                                                }
                                                                                <HiOutlineExternalLink className="ml-1" />
                                                                            </a>
                                                                        </td>
                                                                    </tr>
                                                                ) : null}
                                                                {personalInfo.github ? (
                                                                    <tr>
                                                                        <th className="flex items-center">
                                                                            <SiGithub className="mr-2 text-primary opacity-50" />
                                                                            Github
                                                                        </th>
                                                                        <td>
                                                                            <a
                                                                                rel="noreferrer"
                                                                                target="_blank"
                                                                                href={`https://www.github.com/${personalInfo.github}`}
                                                                                className="text-sky-700 flex items-center"
                                                                            >
                                                                                github.com/
                                                                                {
                                                                                    personalInfo.github
                                                                                }
                                                                                <HiOutlineExternalLink className="ml-1" />
                                                                            </a>
                                                                        </td>
                                                                    </tr>
                                                                ) : null}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-sm text-gray-600">
                                                Data not available
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="card w-full shadow-xl bg-white text-secondary">
                                    <div className="card-body">
                                        <h2 className="card-title">
                                            <HiOutlineOfficeBuilding className="text-primary" />
                                            Company Information
                                        </h2>
                                        {companyInfo ? (
                                            <div className="overflow-x-auto">
                                                <table className="table w-full text-sm">
                                                    <tbody>
                                                        {companyInfo.logo ? (
                                                            <tr>
                                                                <th></th>
                                                                <td>
                                                                    <img
                                                                        className="h-16"
                                                                        src={
                                                                            companyInfo.logo
                                                                        }
                                                                        alt=""
                                                                    ></img>
                                                                </td>
                                                            </tr>
                                                        ) : null}
                                                        <tr>
                                                            <th>Name</th>
                                                            <td>
                                                                {
                                                                    companyInfo.name
                                                                }
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <th>Domain</th>
                                                            <td>
                                                                {
                                                                    companyInfo.domain
                                                                }
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <th>Industry</th>
                                                            <td>
                                                                {
                                                                    companyInfo.industry
                                                                }
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <th>
                                                                Estimated Annual
                                                                Revenue
                                                            </th>
                                                            <td>
                                                                {
                                                                    companyInfo.revenue
                                                                }
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <th>
                                                                Employees Range
                                                            </th>
                                                            <td>
                                                                {
                                                                    companyInfo.employees
                                                                }
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                <div
                                                    tabIndex={0}
                                                    className="collapse collapse-arrow"
                                                >
                                                    <input type="checkbox" />
                                                    <div className="collapse-title text-lg font-medium flex items-center bg-light rounded-lg">
                                                        <HiOutlineLink className="mr-2 opacity-80 text-primary" />
                                                        Online Presence
                                                    </div>
                                                    <div className="collapse-content">
                                                        <table className="table w-full text-sm">
                                                            <tbody>
                                                                {companyInfo.linkedin ? (
                                                                    <tr>
                                                                        <th className="flex items-center">
                                                                            <SiLinkedin className="mr-2 text-primary opacity-50" />
                                                                            LinkedIn
                                                                        </th>
                                                                        <td>
                                                                            <a
                                                                                rel="noreferrer"
                                                                                target="_blank"
                                                                                href={`https://www.linkedin.com/${companyInfo.linkedin}`}
                                                                                className="text-sky-700 flex items-center"
                                                                            >
                                                                                linkedin.com/
                                                                                {
                                                                                    companyInfo.linkedin
                                                                                }
                                                                                <HiOutlineExternalLink className="ml-1" />
                                                                            </a>
                                                                        </td>
                                                                    </tr>
                                                                ) : null}
                                                                {companyInfo.twitter ? (
                                                                    <tr>
                                                                        <th className="flex items-center">
                                                                            <SiTwitter className="mr-2 text-primary opacity-50" />
                                                                            Twitter
                                                                        </th>
                                                                        <td>
                                                                            <a
                                                                                rel="noreferrer"
                                                                                target="_blank"
                                                                                href={`https://www.linkedin.com/${companyInfo.twitter}`}
                                                                                className="text-sky-700 flex items-center"
                                                                            >
                                                                                twitter.com/
                                                                                {
                                                                                    companyInfo.twitter
                                                                                }
                                                                                <HiOutlineExternalLink className="ml-1" />
                                                                            </a>
                                                                        </td>
                                                                    </tr>
                                                                ) : null}
                                                                {companyInfo.crunchbase ? (
                                                                    <tr>
                                                                        <th className="flex items-center">
                                                                            <SiCrunchbase className="mr-2 text-primary opacity-50" />
                                                                            Crunchbase
                                                                        </th>
                                                                        <td>
                                                                            <a
                                                                                rel="noreferrer"
                                                                                target="_blank"
                                                                                href={`https://www.linkedin.com/${companyInfo.crunchbase}`}
                                                                                className="text-sky-700 flex items-center"
                                                                            >
                                                                                twitter.com/
                                                                                {
                                                                                    companyInfo.crunchbase
                                                                                }
                                                                                <HiOutlineExternalLink className="ml-1" />
                                                                            </a>
                                                                        </td>
                                                                    </tr>
                                                                ) : null}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-sm text-gray-600">
                                                Data not available
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="stats shadow-xl w-full overflow-x-auto mb-10">
                                <div className="stat">
                                    <div className="stat-figure text-secondary">
                                        <HiOutlineNewspaper
                                            size={48}
                                            className="text-primary"
                                        />
                                    </div>
                                    <div className="stat-title">
                                        Whitepaper Downloads
                                    </div>
                                    <div className="stat-value">
                                        {hsData?.whitepaperDownloads}
                                    </div>
                                    <div className="stat-desc">
                                        Last updated on {hsData?.modifiedAt}
                                    </div>
                                </div>

                                <div className="stat">
                                    <div className="stat-figure text-secondary">
                                        <HiOutlineViewGridAdd
                                            size={48}
                                            className="text-primary"
                                        />
                                    </div>
                                    <div className="stat-title">
                                        Webinar Registrations
                                    </div>
                                    <div className="stat-value">
                                        {hsData?.webinarRegistrations}
                                    </div>
                                    <div className="stat-desc">
                                        Last updated on {hsData?.modifiedAt}
                                    </div>
                                </div>

                                <div className="stat">
                                    <div className="stat-figure text-secondary">
                                        <HiOutlineTrendingUp
                                            size={48}
                                            className="text-primary"
                                        />
                                    </div>
                                    <div className="stat-title">
                                        Interested Products
                                    </div>
                                    <ul className="stat-value text-lg uppercase">
                                        {hsData?.interestedProducts?.map(
                                            (e: string, i: number) => (
                                                <li
                                                    className="flex items-center"
                                                    key={i}
                                                >
                                                    <HiOutlineStar
                                                        size={12}
                                                        className="mr-1 opacity-60"
                                                    />
                                                    {e}
                                                </li>
                                            )
                                        )}
                                    </ul>
                                    <div className="stat-desc"></div>
                                </div>
                            </div>
                            {snData && snData?.cases.length !== 0 ? (
                                <div className="grid grid-cols-1 gap-6 pb-10">
                                    <div className="card w-full shadow-xl bg-white text-secondary">
                                        <div className="card-body">
                                            <h2 className="card-title mb-2">
                                                <HiOutlineAnnotation className="text-primary" />
                                                Cases
                                            </h2>
                                            <div className="overflow-x-auto">
                                                <table className="table table-compact w-full">
                                                    <thead>
                                                        <tr>
                                                            <th>Case Number</th>
                                                            <th>Opened At</th>
                                                            <th>Description</th>
                                                            <th>Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {snData.cases?.map(
                                                            (
                                                                el: any,
                                                                index: number
                                                            ) => (
                                                                <tr key={index}>
                                                                    <td>
                                                                        {
                                                                            el.number
                                                                        }
                                                                    </td>
                                                                    <td>
                                                                        {
                                                                            el.opened_at
                                                                        }
                                                                    </td>
                                                                    <td>
                                                                        {
                                                                            el.short_description
                                                                        }
                                                                    </td>
                                                                    <td>
                                                                        {el.active ===
                                                                        "true" ? (
                                                                            <span className="flex items-center">
                                                                                Open&nbsp;
                                                                                <MdCircle
                                                                                    size={
                                                                                        10
                                                                                    }
                                                                                    color="#fb923c"
                                                                                />
                                                                            </span>
                                                                        ) : (
                                                                            <span className="flex items-center">
                                                                                Closed&nbsp;
                                                                                <MdCircle
                                                                                    size={
                                                                                        10
                                                                                    }
                                                                                    color="#4ade80"
                                                                                />
                                                                            </span>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            )
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    ) : null}
                </Layout>
            ) : (
                <Loader />
            )}
        </>
    );
};

export default ProspectInfo;

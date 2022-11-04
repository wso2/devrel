import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useAuthContext } from "@asgardeo/auth-react";
import Layout from "../../components/Layout";
import Message from "../../components/Message";
import Loader from "../../components/Loader";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const options: ChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
  },
  interaction: {
    intersect: false,
    mode: "index",
  },
  scales: {
    y: {
      grid: {
        drawBorder: false,
        display: true,
        drawOnChartArea: true,
        drawTicks: false,
        borderDash: [5, 5],
      },
      ticks: {
        display: true,
        padding: 10,
        color: "#fbfbfb",
        font: {
          size: 11,
          family: "Open Sans",
          style: "normal",
          lineHeight: 2,
        },
      },
    },
    x: {
      grid: {
        drawBorder: false,
        display: false,
        drawOnChartArea: false,
        drawTicks: false,
        borderDash: [5, 5],
      },
      ticks: {
        display: true,
        color: "#ccc",
        padding: 20,
        font: {
          size: 11,
          family: "Open Sans",
          style: "normal",
          lineHeight: 2,
        },
      },
    },
  },
};

const data = {
  labels: ["Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"],
  datasets: [
    {
      label: "Mobile apps",
      tension: 0.4,
      pointRadius: 0,
      borderColor: "#5e72e4",
      borderWidth: 3,
      fill: true,
      data: [50, 40, 200, 220, 230, 250, 400, 300, 500],
      maxBarThickness: 6,
    },
  ],
};

const messages = [
  {
    id: 1,
    username: "Ivan Buck",
    message: "Can I know how we can change to pay-per-minute plan?",
  },
  { id: 2, username: "Laurent Perrier", message: "Hi, I need a postpaid plan" },
  {
    id: 3,
    username: "John Michael",
    message: "What is the procedure to get a fixed internet plan?",
  },
  {
    id: 4,
    username: "Miriam Eric",
    message: "How can I know, my home location has 5G coverage?",
  },
  {
    id: 6,
    username: "Marina Farga",
    message: "Can I know what are routers available?",
  },
  {
    id: 7,
    username: "Alexa Liras",
    message: "What is the process to change my sim to an e-sim?",
  },
];

const Dashboard = () => {
  const { state } = useAuthContext();

  return (
    <>
      {state.isAuthenticated && !state.isLoading ? (
        <Layout>
          <div>
            <div className="overflow-auto h-screen pb-24 pt-2 pr-2 pl-2 md:pt-0 md:pr-0 md:pl-0">
              <div className="flex flex-col flex-wrap sm:flex-row ">
                <div className="w-full max-w-full px-3 mt-0 lg:w-7/12 lg:flex-none">
                  <div className="border-black/12.5 shadow-xl relative z-20 flex min-w-0 flex-col break-words rounded-2xl border-0 border-solid bg-white bg-clip-border">
                    <div className="border-black/12.5 mb-0 rounded-t-2xl border-b-0 border-solid p-6 pt-4 pb-0">
                      <h6 className="capitalize font-bold mb-2">
                        Customer Satisfaction overview
                      </h6>
                      <p className="mb-0 text-sm leading-normal">
                        <i className="fa fa-arrow-up text-emerald-500"></i>
                        <span className="font-semibold">4% more</span> in 2022
                      </p>
                    </div>
                    <div className="flex-auto h-96">
                      <Line options={options as any} data={data} />
                    </div>
                  </div>
                </div>

                <div className="shadow-lg rounded-lg p-4 bg-white w-5/12">
                  <p className="font-bold text-md text-black">
                    Customer Messages
                  </p>
                  <ul>
                    {messages.map((message) => (
                      <Message
                        key={message.id}
                        username={message.username}
                        message={message.message}
                      />
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Layout>
      ) : (
        <Loader />
      )}
    </>
  );
};

export default Dashboard;

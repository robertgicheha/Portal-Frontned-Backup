import React, { useEffect, useContext } from "react";
import Menu from "../components/layout/Menu";
import BreadCrumb from "../components/sections/BreadCrumb";
import Modules from "../components/sections/Modules";
import { User } from "react-feather";
import { GlobalContext } from "../context/GlobalState";
import { getEmployeeName } from "../utils/helpers";
import Header from "../components/layout/Header";
import ChristmasBanner from "../components/additions/ChristmasBanner";

const Dashboard = () => {
  const { user_info, loadingStatus, voucher, getUserVoucherDetails } =
    useContext(GlobalContext);

  const deadline = voucher?.applicationDeadline; // e.g. "2025-11-30T00:00:00Z"
  const now = new Date();

  // Convert to JS Date for comparison
  const deadlineDate = new Date(deadline);

  const isExpiredOrToday = deadlineDate <= now;

  useEffect(() => {
    getUserVoucherDetails();

    return () => {
      loadingStatus(false);
    };
    // eslint-disable-next-line
  }, []);

  var moment = require("moment");

  const greetingText = () => {
    const now = moment();
    const currentHour = now.local().hour();
    if (currentHour >= 12 && currentHour <= 17) return "Good Afternoon";
    else if (currentHour >= 18) return "Good Evening";
    else return "Good Morning";
  };

  const todayDate = () => {
    var the_date = moment().format("LL");
    return the_date;
  };

  const dayName = () => {
    var day = moment().format("dddd");
    return day;
  };

  const firstName =
    user_info.FirstName ||
    user_info.firstName ||
    user_info.first_name ||
    getEmployeeName(user_info).split(" ")[0] ||
    "";

  const menu = {
    title: greetingText() + (firstName ? ", " + firstName : ""),
    subTitle: "Today is " + dayName() + ", " + todayDate(),
    links: [
      // {
      //   url: "/messages",
      //   text: "Messages",
      //   icon: <MessageSquare size={13} />,
      //   access: 2,
      // },
      {
        url: "/profile/overview",
        text: "My Profile",
        icon: <User size={13} />,
        access: 2,
      },
    ],
  };

  return (
    <>
      <Header />
      <div className="page">
        <div className="container">
          <Menu menu={menu} />
          <BreadCrumb />
          {voucher && (
            <>{!isExpiredOrToday && <ChristmasBanner voucher={voucher} />}</>
          )}
          <div className="row modules">
            <Modules />
          </div>
        </div>
      </div>
    </>
    // <>
    //   {isLoading ? (
    //     <>
    //       <div className="load_screen">
    //         <LoaderScreen text="We are setting up your dashboard" />
    //       </div>
    //     </>
    //   ) : null}

    //   {!isLoading ? (
    //     <>
    //       <Header />
    //       <div className="page">
    //         <div className="container">
    //           <Menu menu={menu} />
    //           <BreadCrumb />
    //           {/* <ChristmasBanner /> */}
    //           <div className="row modules">
    //             <Modules />
    //           </div>
    //         </div>
    //       </div>
    //     </>
    //   ) : null}
    // </>
  );
};

export default Dashboard;

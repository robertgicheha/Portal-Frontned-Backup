import React, { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../../../../context/GlobalState";
import Menu from "../../../layout/Menu";
import BreadCrumb from "../../BreadCrumb";
import LoaderScreen from "../../../../pages/LoaderScreen";
import { Link } from "react-router-dom";
import Header from "../../../layout/Header";
import { useForm } from "react-hook-form";
import { ChevronsLeft, FileText } from "react-feather";
import _ from "lodash";

const Payslip = () => {
  const {
    isLoading,
    getPaySlip,
    downloadSlip,
    loadingStatus,
    getLeaveDetails,
    leave_info,
    deleteSlip,
    payslips,
    user_info,
    userDetailsToUpdate,
  } = useContext(GlobalContext);

  const [MonthDetails, setMonthDetails] = useState({});

  const [company, setCompany] = useState("");

  const [selectedMonth, setSelectedMonth] = useState("Febuary");

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const removeSlip = (emp_id) => {
    setTimeout(function () {
      deleteSlip(emp_id);
    }, 120000);
  };

  const menu = {
    title: "Payslip",
    subTitle: "Download payslip previous month",
    links: [
      // { url: "/messages", text: "Messages", icon: <MessageSquare size={13} /> },
      // { url: "/profile", text: "Profile", icon: <User size={13} /> },
    ],
  };

  const getPrevMonth = () => {
    const current = new Date();

    current.setMonth(current.getMonth() - 1);

    const previousMonth = current.toLocaleString("default", { month: "long" });

    const month = current.getMonth() + 1;

    const month_no = month < 10 ? "0" + month : month;

    const details = { no: month_no, month: previousMonth };

    setMonthDetails(details);
  };

  const currentYear = () => {
    const year = new Date().getFullYear();

    return year;
  };

  const employeeJoinDate = () => {
    let joined = new Date(user_info.DateJoined ? user_info.DateJoined : "");

    joined = joined.getFullYear();

    return joined;
  };

  const { register, handleSubmit, reset, errors } = useForm();

  const months = [
    { no: "01", month: "January" },
    { no: "02", month: "February" },
    { no: "03", month: "March" },
    { no: "04", month: "April" },
    { no: "05", month: "May" },
    { no: "06", month: "June" },
    { no: "07", month: "July" },
    { no: "08", month: "August" },
    { no: "09", month: "September" },
    { no: "10", month: "October" },
    { no: "11", month: "November" },
    { no: "12", month: "December" },
  ];

  const getCurrentMonthName = () => {
    const current = new Date();

    current.setMonth(current.getMonth() - 1);

    const previousMonth = current.toLocaleString("default", { month: "long" });

    setSelectedMonth(previousMonth);
  };

  const companies = ["MIC", "EHS", "MIC-RE"];

  const handleMonth = (e) => {
    const current = months.find((month) => month.no === e.target.value);
    setSelectedMonth(current.month);
  };

  const handleYear = (e) => {
    console.log(e.target.value);
    setSelectedYear(e.target.value);
  };

  const handleCompany = (e) => {
    setCompany(e.target.value);
  };

  const onSubmit = (data) => {
    data["date_filter"] = data["year"] + "-" + data["month"] + "-01";

    // loadingStatus(true);
    getPaySlip(data.date_filter, leave_info.empNo, company);

    reset();
  };

  useEffect(() => {
    currentYear();
    getCurrentMonthName();

    loadingStatus(false);

    getPrevMonth();
    getLeaveDetails();
    userDetailsToUpdate();

    return () => {
      if (payslips.length > 0) {
        deleteSlip(leave_info.empNo);
      }
    };

    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (downloadSlip) {
      removeSlip(leave_info.empNo);
    }

    // eslint-disable-next-line
  }, [downloadSlip]);

  return (
    <>
      <Header />
      <div className="page">
        <div className="container">
          <Menu menu={menu} />
          <BreadCrumb />
          <div className="row">
            <div className="col-md-12 col-12 profile">
              <div className="row content bt">
                {!isLoading ? (
                  <>
                    {!downloadSlip ? (
                      <>
                        <div className="col-md-12 col-lg-6 col-12 mb-2">
                          <span style={{ color: "red" }}>
                            {errors.company && errors.company.message}
                          </span>
                          <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="row"
                          >
                            {/* <div className="col-md-12 col-12">
                              <label>Select month</label>
                            </div> */}
                            <div className="col-md-12 col-12">
                              <div className="slip-date">
                                {/* <div>
                                  <select
                                    name="date"
                                    ref={register({
                                      required: "Please enter password",
                                    })}
                                  >
                                    <option value="01">01</option>
                                  </select>
                                </div> */}
                                <div>
                                  <label>Select company</label>
                                  <select
                                    name="company"
                                    onChange={(e) => handleCompany(e)}
                                    ref={register({
                                      required: "Please select company",
                                    })}
                                  >
                                    <option value="">Select</option>
                                    {companies.map((c, i) => (
                                      <option value={c} key={i}>
                                        {c}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <input
                                    type="hidden"
                                    name="date"
                                    ref={register({
                                      required: "Please enter password",
                                    })}
                                    value="01"
                                  />
                                  <label>Select month</label>
                                  <select
                                    name="month"
                                    ref={register({
                                      required: "Please enter password",
                                    })}
                                    onChange={(e) => handleMonth(e)}
                                  >
                                    <option value={MonthDetails.no}>
                                      {MonthDetails.month}
                                    </option>
                                    {months.map((m, i) => (
                                      <>
                                        {MonthDetails.month !== m.month && (
                                          <option key={i} value={m.no}>
                                            {m.month}
                                          </option>
                                        )}
                                      </>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label>Select year</label>
                                  <select
                                    name="year"
                                    ref={register({
                                      required: "",
                                    })}
                                    onChange={(e) => handleYear(e)}
                                  >
                                    {_.range(
                                      currentYear(),
                                      employeeJoinDate() - 1
                                    ).map((_n, i) => (
                                      <option value={_n} key={i}>
                                        {_n}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            </div>
                            <div className="col-md-12 col-12">
                              <br />
                              <button
                                type="submit"
                                className="btn btn-success update_changes"
                              >
                                Click to generate
                              </button>
                            </div>
                          </form>
                        </div>
                        {/* <div className="col-md-12">
                          <div className="alert alert-info">
                            Kindly note you will only acces your payslip
                            for&nbsp;{getPrevMonth()}&nbsp;2021
                          </div>
                        </div> */}
                      </>
                    ) : (
                      <>
                        <div className="col-md-12">
                          <div className="document_list">
                            {payslips.length > 0 ? (
                              <>
                                <div className="row">
                                  <div className="col-md-8 col-12">
                                    <div className="alert alert-info">
                                      To get your pay slip stamped kindly visit
                                      HR with a printed copy
                                    </div>
                                  </div>
                                </div>
                                <div className="row">
                                  <div className="col-md-8 col-12">
                                    <Link
                                      to={`/documents/${leave_info.empNo}/payslip/${leave_info.empNo}_${selectedMonth}_${selectedYear}.pdf`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      download
                                    >
                                      <FileText size={19} />
                                      &nbsp;Click to download -{" "}
                                      {`${leave_info.empNo}_${selectedMonth}_${selectedYear}.pdf`}
                                      <br />
                                      <br />
                                    </Link>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="alert alert-danger">
                                We could not find any payslips under{" "}
                                <b>{company}</b>. Please change company and try
                                again
                              </div>
                            )}
                            <div className="row">
                              <div className="col-md-8 col-12">
                                <Link
                                  className="back-payslip"
                                  to="/profile/payslip"
                                  onClick={() => deleteSlip(leave_info.empNo)}
                                >
                                  <ChevronsLeft size={16} />
                                  &nbsp;Go Back to payslip
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <>
                      <div className="small_load_screen">
                        <LoaderScreen text="This might take some time, fetching payslip" />
                      </div>
                    </>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Payslip;

import React, { useContext } from "react";
import { GlobalContext } from "../../context/GlobalState";

const MIC_BANNER = `${process.env.PUBLIC_URL}/media/${encodeURIComponent("Christmas MIC banner.webp")}`;
const EHS_BANNER = `${process.env.PUBLIC_URL}/media/${encodeURIComponent("Christmas EHS banner.webp")}`;

const ChristmasBanner = ({ voucher }) => {
  const { user_info = {} } = useContext(GlobalContext);
  const companyEmail = String(user_info.CompanyEmail || "").toLowerCase();
  const branch = String(user_info.Branch || "").toLowerCase();
  const department = String(user_info.Dept || user_info.Department || "").toLowerCase();
  const isEhs =
    companyEmail.includes("ehs") ||
    branch.includes("healthcare") ||
    branch.includes("executive") ||
    department.includes("ehs");
  const banner = isEhs ? EHS_BANNER : MIC_BANNER;

  // Handle loading/empty state: render nothing
  if (!voucher || (Array.isArray(voucher) && voucher.length === 0)) return null;

  // Normalize (API might return array or object)
  const v = Array.isArray(voucher) ? voucher[0] : voucher;

  // Helper: safely get option name
  const getOptionName = () => {
    const { optionSelected, optionAvailable = [] } = v;
    const selected = optionAvailable.find((o) => o.code === optionSelected);
    return selected ? selected.name : "Unknown Option";
  };

  return (
    <div
      className="xmas-banner"
      style={{
        backgroundImage: `url(${banner})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "100% 100%",
        backgroundPosition: "center center",
      }}
    >
      <h5>Christmas Voucher</h5>
      {v.optionSelected ? (
        <h6>
          You have chosen <br />
          {getOptionName()}
        </h6>
      ) : (
        <h6>Have you selected yours?</h6>
      )}
      <p>
        {v.optionSelected
          ? "You will be notified when it is ready for collection"
          : "Deadline is"}{" "}
        {/* {v.applicationDeadline && (
          <Moment format="Do MMM YYYY">
            <u>{v.applicationDeadline}</u>
          </Moment>
        )} */}
      </p>
      <br />
      {/* <Link to="/choose-supermarket">
        {v.optionSelected ? "Update" : "Choose"} supermarket
      </Link> */}
      <hr />
    </div>
  );
};

export default ChristmasBanner;

import React, { useRef, useEffect, useState, useContext } from "react";
import { Inbox, User, LogOut, Users, HelpCircle } from "react-feather";
import { Link } from "react-router-dom";
import { GlobalContext } from "../../context/GlobalState";
import logo from "../../images/logos/logo.png";
import user_profile from "../../images/user.png";
// import user from "../../images/user.jpg";
import FloatingMenu from "./FloatingMenu";

const Header = () => {
  const node = useRef();

  const {
    handleLogout,
    globals,
    leave_approvals,
    user_info,
    user_info_to_update,
    getUserDetails,
    getLeaveApprovals,
    getNotifications,
    notifications,
  } = useContext(GlobalContext);

  const [floatingProperties, setfloatingProperties] = useState({
    position: 0,
    toShow: null,
  });

  const [profile, setprofile] = useState(false);

  const openProfile = () => {
    setfloatingProperties({
      toShow: null,
    });
    setprofile(!profile);
  };

  const openView = (toShow) => {
    setprofile(false);

    let marginLeft;

    if (toShow === "help") {
      marginLeft = "-170px";
    }
    //55
    if (toShow === "messages") {
      marginLeft = "-225px";
    }
    //60
    if (toShow === "announcement") {
      marginLeft = "-282px";
    }
    //55
    if (toShow === "manage") {
      marginLeft = "-340px";
    }
    //55
    if (toShow === "requests") {
      marginLeft = "-395px";
    }
    //55
    // if you add another one add 60

    setfloatingProperties({
      position: marginLeft,
      toShow,
    });
  };

  const handleClick = (e) => {
    if (!node.current.contains(e.target)) {
      setfloatingProperties({
        toShow: null,
      });
      setprofile(false);
      return;
    }
  };

  const showDefault = (e) => {
    e.target.src =
      "https://portal.micglobalrisks.com:8081/documents/defaults/user.png";
  };

  const employeeName = (() => {
    const details = user_info || {};
    const updateDetails = user_info_to_update || {};
    const fullName =
      details.FullName ||
      details.fullName ||
      details["Full Name"] ||
      details.Name ||
      details.name ||
      updateDetails.FullName ||
      updateDetails.fullName ||
      updateDetails["Full Name"] ||
      updateDetails.Name ||
      updateDetails.name;
    if (fullName) return String(fullName).trim();

    return [
      details.FirstName ||
        details.firstName ||
        updateDetails.FirstName ||
        updateDetails.firstName,
      details.MiddleName ||
        details.middleName ||
        updateDetails.MiddleName ||
        updateDetails.middleName,
      details.LastName ||
        details.lastName ||
        updateDetails.LastName ||
        updateDetails.lastName,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();
  })();

  useEffect(() => {
    getUserDetails();
    getLeaveApprovals();
    getNotifications();

    document.addEventListener("mousedown", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <header>
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <Link
                to="/"
                className="logos"
                style={{
                  backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.0), rgba(255, 255, 255, 0.0)),url(${logo})`,
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              ></Link>
              <div className="profile" ref={node}>
                <div className="icon">
                  <img
                    onClick={() => openProfile()}
                    onError={(e) => showDefault(e)}
                    src={user_profile}
                    alt=""
                  />
                </div>
                <FloatingMenu
                  floatingProperties={floatingProperties}
                  leave_approvals={leave_approvals}
                  notifications={notifications}
                />
                <div
                  className="profile-options"
                  style={{
                    display: profile ? "" : "none",
                  }}
                >
                  <div className="arrow-up"></div>
                  <ul>
                    <li>
                      {employeeName}
                    </li>
                    <li>
                      <Link to="/profile">
                        <User size={15} />
                        &nbsp;&nbsp;My Profile
                      </Link>
                    </li>
                    <li>
                      <Link to="" onClick={() => handleLogout()}>
                        <LogOut size={15} />
                        &nbsp;&nbsp;Logout
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="notify">
                {globals.role === 1 && (
                  <div
                    title="Leave requests"
                    className={
                      "notifications " +
                      (floatingProperties.toShow === "requests" && "active")
                    }
                    onClick={() => openView("requests")}
                  >
                    <div className="icon">
                      <Inbox size={23} />
                    </div>
                    {leave_approvals.length > 0 && (
                      <div className="number">{leave_approvals.length}</div>
                    )}
                  </div>
                )}
                {globals.role === 1 && (
                  <div
                    title="Staff Management"
                    className={
                      "notifications " +
                      (floatingProperties.toShow === "manage" && "active")
                    }
                    onClick={() => openView("manage")}
                  >
                    <div className="icon">
                      <Users size={23} />
                    </div>
                    {notifications > 0 && (
                      <div className="number">{notifications}</div>
                    )}
                  </div>
                )}
                {/* <div
                  title="Announcement"
                  className={
                    "notifications " +
                    (floatingProperties.toShow === "announcement" && "active")
                  }
                  onClick={() => openView("announcement")}
                >
                  <div className="icon">
                    <Bell size={23} />
                  </div>
                  {notifications > 0 && (
                    <div className="number">{notifications}</div>
                  )}
                </div> */}
                {/* <div
                  title="Messages"
                  className={
                    `notifications ` +
                    (floatingProperties.toShow === "messages" && "active")
                  }
                  onClick={() => openView("messages")}
                >
                  <div className="icon">
                    <MessageSquare size={23} />
                  </div>
                  {notifications > 0 && (
                    <div className="number">{notifications}</div>
                  )}
                </div> */}
                <div
                  title="Support Center"
                  className={
                    `notifications ` +
                    (floatingProperties.toShow === "help" && "active")
                  }
                  onClick={() => openView("help")}
                >
                  <div className="icon">
                    <HelpCircle size={23} />
                  </div>
                  {/* <div className="number">3</div> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;

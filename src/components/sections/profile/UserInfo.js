import React, { useState, useContext, useEffect } from "react";
import moment from "moment";
import { Link } from "react-router-dom";
import { Animated } from "react-animated-css";
import { DownOutlined, UpOutlined } from "@ant-design/icons";
import AddNextOfKin from "./NextOfKin/AddNextOfKin";
import AddDependent from "./Dependant/AddDependent";
import DependentView from "./Dependant/DependentView";
import NextOfKinView from "./NextOfKin/NextOfKinView";
import ProfilePicture from "./ProfilePicture";
import EditCompanyInfo from "./Company/EditCompanyInfo";
import EditPersonal from "./Personal/EditPersonal";
import EditContact from "./Contact/EditContact";
import EducationInfo from "./Education/EducationInfo";
import { GlobalContext } from "../../../context/GlobalState";

const GeneralInfo = ({
  leave_info,
  globals,
  unsetSlip,
  update_status,
  user_info,
}) => {
  const {
    updateProfile,
    isUpdatingProfile,
    addQualification,
    getQualifications,
    qualifications,
    sectionUpdating,
  } = useContext(GlobalContext);

  const [state, setstate] = useState({
    edit_company_info: false,
    more_option: false,
    add_dependent: false,
    add_kin: false,
  });

  const [editCompany, seteditCompany] = useState(false);
  const [editPersonal, seteditPersonal] = useState(false);
  const [editContact, seteditContact] = useState(false);
  const [addEducation, setaddEducation] = useState(false);
  const [editing, setediting] = useState(null);
  const [addDependant, setaddDependant] = useState(false);
  const [addKin, setKin] = useState(false);

  const toggleMoreOptions = () => {
    setstate({
      more_option: !state.more_option,
    });
  };

  const { more_option } = state;

  useEffect(() => {
    getQualifications();

    sectionUpdating(false);

    if (!isUpdatingProfile) {
      seteditCompany(false);
      seteditPersonal(false);
      seteditContact(false);
      setaddEducation(false);
      setediting(null);
      setaddDependant(false);
      setKin(false);
    }

    // eslint-disable-next-line
  }, [isUpdatingProfile]);

  return (
    <>
      <ProfilePicture staff={user_info.EmployeeNumber} />
      <Animated
        // animationIn="fadeInUp"
        // animationOut="fadeOut"
        // isVisible={true}
        className="row content"
      >
        <div className="col-md-12 col-12">
          <h6>
            {/* Company Information */}
            Company Information
            {/* {!update_status.company ? (
              <button
                onClick={() => {
                  seteditPersonal(false);
                  seteditContact(false);
                  seteditCompany(!editCompany);
                  setaddEducation(false);
                  setediting(null);
                  setaddDependant(false);
                }}
              >
                {!editCompany && <>Update info</>}
              </button>
            ) : null} */}
          </h6>
          <hr />
        </div>
        {update_status.company ? (
          <div className="col-md-12 col-12">
            <div className="alert alert-info text-center">
              <b>NOTE</b>: You have open changes pending approval
            </div>
          </div>
        ) : null}
        <div className="col-md-12 col-12">
          <div className="row">
            {editCompany ? (
              <EditCompanyInfo
                user_info={user_info}
                seteditCompany={seteditCompany}
                updateProfile={updateProfile}
                globals={globals}
                isUpdatingProfile={isUpdatingProfile}
              />
            ) : (
              <>
                <div className="col-md-5 col-12">
                  <ul>
                    <li>
                      Job title
                      <br />
                      <span>
                        {user_info.JobTitle ? (
                          <>{user_info.JobTitle}</>
                        ) : (
                          <span style={{ color: "red" }}>Not set</span>
                        )}
                      </span>
                    </li>
                    <li>
                      Department
                      <br />
                      <span>
                        {leave_info.rCenter ? (
                          <>{leave_info.rCenter}</>
                        ) : (
                          <span style={{ color: "red" }}>Not set</span>
                        )}
                      </span>
                    </li>
                    <li>
                      Offical work email
                      <br />
                      <span>
                        {user_info.CompanyEmail ? (
                          <>{user_info.CompanyEmail}</>
                        ) : (
                          <>{globals.username}</>
                        )}
                      </span>
                    </li>
                    <li>
                      Member since:&nbsp;
                      <br />
                      <span>
                        {user_info.DateJoined ? (
                          <>
                            {moment(user_info.DateJoined).format("DD/MM/YYYY")}
                          </>
                        ) : (
                          <span style={{ color: "red" }}>Not set</span>
                        )}
                      </span>
                    </li>
                  </ul>
                </div>
                <div className="col-md-6 col-12">
                  <ul>
                    <li>
                      Employee No:&nbsp;
                      <br />
                      <span>{user_info.EmployeeNumber}</span>
                    </li>
                    <li>
                      Line Manager:&nbsp;
                      <br />
                      <span> {leave_info.supervisor}</span>
                    </li>
                    <li>
                      Job status:&nbsp;
                      <br />
                      <span>Full time</span>
                    </li>
                    <li>
                      Office Extension:&nbsp;
                      <br />
                      <span>
                        {user_info.Ext ? (
                          user_info.Ext
                        ) : (
                          <span style={{ color: "red" }}>Not set</span>
                        )}
                      </span>
                    </li>
                  </ul>
                </div>
                <div className="col-md-8 col-6">
                  {/* <div className="alert alert-danger">
                    Pay slip and P9 features are currently unavailable.
                    <br />
                    Kindly seek assistance from the HR Department
                  </div> */}
                  <button
                    className="more_options"
                    onClick={() => toggleMoreOptions()}
                  >
                    MORE OPTIONS&nbsp;&nbsp;
                    {more_option ? (
                      <UpOutlined size={15} />
                    ) : (
                      <DownOutlined size={15} />
                    )}
                  </button>
                </div>
                {more_option && (
                  <div className="col-12">
                    <br />
                    <ul>
                      <li>
                        {/* <div className="alert alert-danger">
                          Payslip is currently unavailable. PLease try again
                          later.
                        </div> */}
                        <Link
                          onClick={() => unsetSlip(false)}
                          to="/profile/payslip"
                        >
                          Download Payslip
                        </Link>
                      </li>
                      <li>
                        <Link to="/profile/p9">Download P9 Form</Link>
                      </li>
                      {/* <li>
                        <Link>Employee Documents</Link>
                      </li>
                      <li>
                        <Link to="/profile/salary-advance">
                          Click to request Salary Advance
                        </Link>
                      </li> */}
                    </ul>
                  </div>
                )}
                {/* {user_info.JobTitle && (
                  <>
                    
                  </>
                )} */}
              </>
            )}
          </div>
        </div>
      </Animated>
      <Animated className="row content">
        <div className="col-md-12 col-12">
          <h6>
            Personal Information
            {!update_status.personal ? (
              <button
                onClick={() => {
                  seteditPersonal(!editPersonal);
                  seteditContact(false);
                  seteditCompany(false);
                  setaddEducation(false);
                  setediting(null);
                }}
              >
                {!editPersonal && <>Update info</>}
              </button>
            ) : null}
          </h6>
          <hr />
        </div>
        {update_status.personal ? (
          <div className="col-md-12 col-12">
            <div className="alert alert-info text-center">
              <b>NOTE</b>: You have open changes pending approval
            </div>
          </div>
        ) : null}
        {editPersonal ? (
          <EditPersonal
            pending={update_status.personal}
            user_info={user_info}
            seteditPersonal={seteditPersonal}
            updateProfile={updateProfile}
            globals={globals}
            isUpdatingProfile={isUpdatingProfile}
          />
        ) : (
          <>
            <div className="col-md-4 col-12">
              <ul>
                <li>
                  Full Name
                  <br />
                  <span>
                    {user_info.FirstName ? user_info.FirstName : ""}&nbsp;
                    {user_info.MiddleName ? user_info.MiddleName : ""}&nbsp;
                    {user_info.LastName ? user_info.LastName : ""}
                  </span>
                </li>
                <li>
                  Gender
                  <br />
                  <span>{user_info.Gender === 1 ? "Female" : "Male"}</span>
                </li>
                <li>
                  Date of birth
                  <br />
                  <span>{moment(user_info.BDate).format("DD/MM/YYYY")}</span>
                </li>
                <li>
                  Marital status
                  <br />
                  <span>
                    {user_info.Status < 2 && "Single"}
                    {user_info.Status === 2 && "Married"}
                    {user_info.Status === 3 && "Separated"}
                    {user_info.Status === 4 && "Divorced"}
                    {user_info.Status === 5 && "Widow(er)"}
                    {user_info.Status === 6 && "Other"}
                  </span>
                </li>
                <li>
                  National ID
                  <br />
                  <span>{user_info.ID}</span>
                </li>
              </ul>
            </div>
            <div className="col-md-3 col-12">
              <ul>
                <li>
                  KRA Pin:&nbsp;
                  <br />
                  <span>
                    {user_info.kraPin ? (
                      user_info.kraPin
                    ) : (
                      <span style={{ color: "red" }}>Not set</span>
                    )}
                  </span>
                </li>
                <li>
                  NHIF:&nbsp;
                  <br />
                  <span>
                    {user_info.NHIF ? (
                      user_info.NHIF
                    ) : (
                      <span style={{ color: "red" }}>Not set</span>
                    )}
                  </span>
                </li>
                <li>
                  NSSF:&nbsp;
                  <br />
                  <span>
                    {user_info.NSSF ? (
                      user_info.NSSF
                    ) : (
                      <span style={{ color: "red" }}>Not set</span>
                    )}
                  </span>
                </li>
                <li>
                  HELB:&nbsp;
                  <br />
                  <span>
                    {user_info.HELB ? (
                      user_info.HELB
                    ) : (
                      <span style={{ color: "red" }}>Not applicable</span>
                    )}
                  </span>
                </li>
              </ul>
            </div>
            <div className="col-md-5 col-12">
              <ul>
                <li>
                  Bank Details
                  <br />
                  <span>
                    A/C:&nbsp;{user_info.BankACCNo}
                    <br />
                    {user_info.Branch}
                  </span>
                  {/* <br /> */}
                  {/* <button className="btn-bank">Change bank details</button> */}
                </li>
              </ul>
            </div>
          </>
        )}
      </Animated>
      <Animated className="row content">
        <div className="col-md-12 col-12">
          <h6>
            Contact Information
            {!update_status.contacts ? (
              <button
                onClick={() => {
                  seteditPersonal(false);
                  seteditContact(!editContact);
                  seteditCompany(false);
                  setaddEducation(false);
                  setediting(null);
                }}
              >
                {!editContact && <>Update info</>}
              </button>
            ) : null}
          </h6>
          <hr />
        </div>
        {editContact ? (
          <EditContact
            user_info={user_info}
            seteditContact={seteditContact}
            updateProfile={updateProfile}
            globals={globals}
            isUpdatingProfile={isUpdatingProfile}
          />
        ) : (
          <>
            <div className="col-md-6 col-12">
              <ul>
                <li>
                  Personal email
                  <br />
                  <span>
                    {user_info.Email ? (
                      user_info.Email
                    ) : (
                      <span style={{ color: "red" }}>Not set</span>
                    )}
                  </span>
                </li>
                <li>
                  Personal mobile
                  <br />
                  <span>
                    {user_info.Phone ? (
                      user_info.Phone
                    ) : (
                      <span style={{ color: "red" }}>Not set</span>
                    )}
                  </span>
                </li>
                <li>
                  Postal address
                  <br />
                  <span>
                    {user_info.Address ? (
                      user_info.Address
                    ) : (
                      <span style={{ color: "red" }}>Not set</span>
                    )}
                  </span>
                </li>
              </ul>
            </div>
            <div className="col-md-6 col-12">
              <ul>
                <li>
                  Residential area
                  <br />
                  <span>
                    {user_info.ResAddr ? (
                      user_info.ResAddr
                    ) : (
                      <span style={{ color: "red" }}>Not set</span>
                    )}
                  </span>
                </li>
              </ul>
            </div>
          </>
        )}
      </Animated>
      <Animated className="row content">
        <EducationInfo
          seteditPersonal={seteditPersonal}
          seteditContact={seteditContact}
          seteditCompany={seteditCompany}
          addEducation={addEducation}
          setaddEducation={setaddEducation}
          isUpdatingProfile={isUpdatingProfile}
          addQualification={addQualification}
          qualifications={qualifications}
          setediting={setediting}
          editing={editing}
        />
      </Animated>
      <>
        {addDependant ? (
          <>
            <AddDependent
              setaddDependant={setaddDependant}
              isUpdatingProfile={isUpdatingProfile}
              update_code={user_info.docNo}
            />
          </>
        ) : (
          <DependentView
            setaddDependant={setaddDependant}
            dependant_count={update_status.dependants_Count}
            update_code={user_info.docNo}
            username={user_info.CompanyEmail}
          />
        )}

        {addKin ? (
          <>
            <AddNextOfKin
              setKin={setKin}
              isUpdatingProfile={isUpdatingProfile}
              update_code={user_info.docNo}
            />
          </>
        ) : (
          <NextOfKinView
            setKin={setKin}
            next_of_kin_count={update_status.nextOfKin_Count}
            update_code={user_info.docNo}
          />
        )}
      </>
    </>
  );
};

export default GeneralInfo;

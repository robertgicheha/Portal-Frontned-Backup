import React, { createContext, useReducer, useEffect } from "react";
import AppReducer from "./AppReducer";
import axios from "axios";
import jwt from "jwt-simple";
import { encryptData, decryptData } from "../utils/helpers";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
// import _ from "lodash";

const initialState = {
  access_token: null,
  isLoggedin: false,
  userCheck: false,
  isLoading: null,
  isUpdatingProfile: null,
  shouldChangePassword: false,
  privilege: "",
  globals: {},
  user_info: {},
  user_info_to_update: {},
  dependant_info: [],
  leave_info: {},
  leave_history: [],
  leave_approvals: [],
  next_of_kin: [],
  ehs_staff: [],
  mic_staff: [],
  message: "",
  slip_info: {},
  downloadSlip: false,
  downloadP9: false,
  payslips: [],
  p_nine: [],
  notifications: 0,
  tickets: [],
  qualifications: [],
  update_status: {
    personal: false,
    company: false,
    contacts: false,
    nextOfKin_Count: 0,
    dependants_Count: 0,
  },
  objectives: [],
  developments: [],
  team_objectives: [],
  team_developments: [],
  voucher: [],
  vacancies: [],
  vacancy: {},
};

export const GlobalContext = createContext(initialState);

export const GlobalProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AppReducer, initialState);

  const addCookie = (payload, cookie_name) => {
    // var date = new Date();
    // var minutes = 1;
    // date.setTime(date.getTime() + minutes * 60 * 1000);

    var date = new Date();
    date.setTime(date.getTime() + 24 * 60 * 60 * 1000);

    Cookies.set(cookie_name, payload, {
      expires: date,
      secure: true,
    });
  };

  // Base URL for the API
  // hint: remember to remove trailling slash
  const baseURL = "https://portal.micglobalrisks.com:8082/portal/v1.0/api";

  // This recovered source tree has no .env, so REACT_APP_SECRET is
  // undefined at runtime. The portal build files decode tokens with
  // "kimiko", so fall back to that same secret when the env var is missing.
  const jwtSecret = process.env.REACT_APP_SECRET || "kimiko";

  function tokenInfo() {
    if (localStorage.LOGIN_INFO) {
      var token = localStorage.LOGIN_INFO;

      try {
        return jwt.decode(token, jwtSecret);
      } catch (e) {
        // Corrupted, mismatched-secret, or otherwise undecodable token --
        // treat it the same as "not logged in" instead of crashing, and
        // clear it so it doesn't keep failing on every future call.
        localStorage.removeItem("LOGIN_INFO");
        Cookies.remove("refresh_token");
        return false;
      }
    }
    return false;
  }

  function setGlobalInfo() {
    const check_token = tokenInfo();

    if (!check_token) return;

    dispatch({
      type: "SET_GLOBAL_INFO",
      payload: check_token.data,
    });
  }

  function setMessage(text = "") {
    dispatch({
      type: "MESSAGE",
      payload: text,
    });
  }

  function loginStatus() {
    let login = false;

    if (Cookies.get("refresh_token")) {
      // tokenInfo() clears refresh_token/LOGIN_INFO itself if the stored
      // token turns out to be undecodable, so checking it here (rather
      // than trusting cookie presence alone) avoids briefly reporting
      // isLoggedin=true for a session that's actually already dead.
      login = !!tokenInfo();
      if (login) setGlobalInfo();
    }

    dispatch({
      type: "LOG_STATUS",
      payload: login,
    });

    setMessage("");
  }

  function loadingStatus(to_set) {
    dispatch({
      type: "SET_LOADING",
      payload: to_set,
    });
  }

  function getNotifications() {
    dispatch({
      type: "GET_NOTIFICATIONS",
      // payload: Math.floor(Math.random() * 11),
      payload: 0,
    });
  }

  function unsetSlip(action) {
    dispatch({
      type: "GET_PAYSLIP",
      payload: action,
    });
  }

  function unsetP9(action) {
    dispatch({
      type: "GET_PNINE",
      payload: action,
    });
  }

  function sectionUpdating(action) {
    dispatch({
      type: "SET_UPDATE_PROFILE",
      payload: action,
    });
  }

  async function updatePassword(inputs) {
    inputs.email = localStorage.username;

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const res = await axios.post(
        `${baseURL}/user/change_password`,
        inputs,
        config
      );

      if (!res.data.error) {
        if (res.data.data === undefined) {
          Swal.fire({
            icon: "info",
            html: "<h5>Server is under maintenance.<br/> Please try again later</h5>",
          });
        } else {
          const { token } = res.data.data;
          localStorage.LOGIN_INFO = token;

          loginStatus();

          localStorage.removeItem("username");

          setTimeout(() => {
            getUserDetails();
            getLeaveDetails();
            getLeaveHistory();
          }, 10);
        }
      }
    } catch (error) {
      if (axios.isCancel(error)) return;
    }

    loadingStatus(false);
  }

  async function checkUsername(inputs) {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    try {
      const res = await axios.post(
        `${baseURL}/user/check_user`,
        inputs,
        config
      );

      if (res.data.error) {
        setMessage(res.data.message + ". Please contact Admin");
      }

      if (!res.data.error) {
        if (res.data.data === undefined) {
          Swal.fire({
            icon: "info",
            html: "<h5>Server is under maintenance.<br/> Please try again later</h5>",
          });
        } else {
          const { username, password_changed } = res.data.data;

          const payload = {
            userchecked: true,
            updatepass: !password_changed,
          };

          dispatch({
            type: "CHECK_USER",
            payload,
          });

          localStorage.username = username;
        }
      }
    } catch (error) {
      if (axios.isCancel(error)) return;
      setMessage("Could not reach the server. Please check your connection and try again.");
    }

    loadingStatus(false);
  }

  async function handleLogin(inputs) {
    inputs.email = localStorage.username;

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const res = await axios.post(
        `${baseURL}/user/active_login`,
        inputs,
        config
      );

      if (res.data.error) {
        setMessage(res.data.message);
      }

      if (!res.data.error) {
        const { token, refresh_token } = res.data.data;

        // console.log(token);

        addCookie(refresh_token, "refresh_token");

        localStorage.LOGIN_INFO = token;

        localStorage.removeItem("username");

        dispatch({
          type: "SET_ACCESS_TOKEN",
          access_token:
            "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJtaWNfZWhzX3BvcnRhbCIsImlhdCI6MTY3MDU4NTM5MiwibmJmIjoxNjcwNTg1MzkyLCJleHAiOjE2ODYzNjUzOTIsImF1ZCI6Im1pY19laHNfdXNlciIsImRhdGEiOnsidXNlcm5hbWUiOiJubW9tb3JvQG1pY2dsb2JhbHJpc2tzLmNvbSIsInJvbGUiOjEsImlzX3Bhc3N3b3JkX2NoYW5nZWQiOjF9fQ.Z8e0pu5-L7WvlbUHASRxgKFTGa8cN59t0_odpRjZPlY",
        });

        getUserDetails();
        getLeaveDetails();
        getLeaveHistory();

        loginStatus(false);

        setTimeout(() => {
          window.location.assign("/");
        }, 800);
      }
    } catch (error) {
      if (axios.isCancel(error)) return;
      setMessage("Could not reach the server. Please check your connection and try again.");
    }

    loadingStatus(false);
  }

  // Local-dev-only bypass so the authenticated part of the app can be
  // exercised without a real backend login. Guarded on NODE_ENV so it's
  // dead code (stripped entirely) in a production build -- see Login.js's
  // matching guard around the button that calls this.
  function devLogin(email) {
    if (process.env.NODE_ENV === "production") return;

    const tokenPayload = {
      data: { username: email, role: 1, is_password_changed: 1 },
    };
    localStorage.LOGIN_INFO = jwt.encode(tokenPayload, jwtSecret);

    addCookie("dev-local-session", "refresh_token");

    dispatch({ type: "SET_GLOBAL_INFO", payload: tokenPayload.data });
    dispatch({
      type: "GET_USER_INFO",
      payload: {
        EmployeeNumber: "DEV-LOCAL",
        FirstName: "Local",
        LastName: "Tester",
        CompanyEmail: email,
        Dept: "IT",
      },
    });
    dispatch({ type: "LOG_STATUS", payload: true });

    window.location.assign("/resources-and-forms");
  }

  async function checkUpdateStatus() {
    let details = Cookies.get("__details");

    details = decryptData(details);

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.LOGIN_INFO,
        },
      };
      const res = await axios.get(
        `${baseURL}/user/check_update_status?employee=${details.EmployeeNumber}`,
        config
      );

      if (!res.data.error) {
        dispatch({
          type: "SET_PROFILE_UPDATE_STATUS",
          payload: res.data,
        });
      }
    } catch (error) {
      if (axios.isCancel(error)) return;
    }
  }

  async function userDetailsToUpdate() {
    dispatch({
      type: "SET_UPDATE_PROFILE",
      payload: true,
    });

    if (localStorage.hasOwnProperty("_buffer_user_info")) {
      dispatch({
        type: "GET_USER_INFO_TO_UPDATE",
        payload: JSON.parse(localStorage._buffer_user_info),
      });
    } else {
      const info = tokenInfo();

      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.LOGIN_INFO,
          },
        };

        const res = await axios.get(
          `${baseURL}/user/info_update?username=${info.data.username}`,
          config
        );

        if (!res.data.error) {
          dispatch({
            type: "GET_USER_INFO_TO_UPDATE",
            payload: res.data.data,
          });

          localStorage._buffer_user_info = JSON.stringify(res.data.data);

          getAllNextOfKin();
          getAllDependents();

          dispatch({
            type: "SET_UPDATE_PROFILE",
            payload: false,
          });
        }
      } catch (error) {
        if (axios.isCancel(error)) return;
      }
    }
  }

  async function getUserDetails() {
    const details = Cookies.get("__details");

    if (details) {
      dispatch({
        type: "GET_USER_INFO",
        payload: decryptData(details),
      });
    } else {
      const info = tokenInfo();

      loadingStatus(!state.isLoading ? true : false);

      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.LOGIN_INFO,
          },
        };

        const res = await axios.get(
          `${baseURL}/user/info?username=${info.data.username}`,
          config
        );

        if (!res.data.error) {
          if (res.data.data === null) {
            Swal.fire("Server unavailable. Try again later");
          }

          addCookie(encryptData(res.data.data), "__details");

          dispatch({
            type: "GET_USER_INFO",
            payload: res.data.data,
          });
        }
      } catch (error) {
        if (axios.isCancel(error)) return;
      } finally {
        loadingStatus(false);
      }
    }
  }

  async function getEhsStaff() {
    const staff = localStorage.__ehs_staff;

    if (staff) {
      dispatch({
        type: "GET_ALL_EHS_STAFF",
        payload: decryptData(staff),
      });
    } else {
      loadingStatus(true);
      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.LOGIN_INFO,
          },
        };

        const res = await axios.get(`${baseURL}/staff/ehs-all`, config);

        if (!res.data.error && res.data.data != null) {
          localStorage.__ehs_staff = encryptData(res.data.data);

          dispatch({
            type: "GET_ALL_EHS_STAFF",
            payload: res.data.data,
          });
        }
      } catch (error) {
        if (axios.isCancel(error)) return;
      }
    }

    loadingStatus(false);
  }

  async function getMicStaff() {
    const staff = localStorage.__mic_staff;

    if (staff) {
      dispatch({
        type: "GET_ALL_MIC_STAFF",
        payload: decryptData(staff),
      });
    } else {
      loadingStatus(true);
      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.LOGIN_INFO,
          },
        };

        const res = await axios.get(`${baseURL}/staff/mic-all`, config);

        if (!res.data.error && res.data.data != null) {
          localStorage.__mic_staff = encryptData(res.data.data);

          dispatch({
            type: "GET_ALL_MIC_STAFF",
            payload: res.data.data,
          });
        }
      } catch (error) {
        if (axios.isCancel(error)) return;
      }
    }

    loadingStatus(false);
  }

  async function addQualification(inputs) {
    dispatch({
      type: "SET_UPDATE_PROFILE",
      payload: true,
    });

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.LOGIN_INFO,
        },
      };

      const res = await axios.post(
        `${baseURL}/qualification/add`,
        inputs,
        config
      );

      if (!res.data.error) {
        try {
          const config = {
            headers: {
              "Content-Type": "application/json",
              Authorization: localStorage.LOGIN_INFO,
            },
          };

          const info = tokenInfo();

          const res = await axios.get(
            `${baseURL}/qualification/get?email=${info.data.username}`,
            config
          );

          if (!res.data.error && res.data.data != null) {
            dispatch({
              type: "GET_QUALIFICATIONS",
              payload: res.data.data,
            });

            dispatch({
              type: "SET_UPDATE_PROFILE",
              payload: false,
            });
          }
        } catch (error) {
          if (axios.isCancel(error)) return;
        }
      }

      // if (!res.data.error && res.data.data != null) {
      //   try {
      //     const config = {
      //       headers: {
      //         "Content-Type": "application/json",
      //         Authorization: localStorage.LOGIN_INFO,
      //       },
      //     };

      //     const info = tokenInfo();

      //     const res = await axios.get(
      //       `${baseURL}/qualification/get?email=${info.data.username}`,
      //       config
      //     );

      //     if (!res.data.error && res.data.data != null) {
      //       dispatch({
      //         type: "GET_QUALIFICATIONS",
      //         payload: res.data.data,
      //       });
      //     }
      //   } catch (error) {}
      // }
    } catch (error) {
      if (axios.isCancel(error)) return;
    }
  }

  async function getQualifications() {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.LOGIN_INFO,
        },
      };

      const info = tokenInfo();

      const res = await axios.get(
        `${baseURL}/qualification/get?email=${info.data.username}`,
        config
      );

      if (!res.data.error && res.data.data != null) {
        dispatch({
          type: "GET_QUALIFICATIONS",
          payload: res.data.data,
        });
      }
    } catch (error) {
      if (axios.isCancel(error)) return;
    }
  }

  async function deleteP9(id) {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.LOGIN_INFO,
        },
      };
      const res = await axios.get(`${baseURL}/user/unlink_p9?id=${id}`, config);

      if (!res.data.error) {
        dispatch({
          type: "GET_PNINE",
          payload: false,
        });
      }
    } catch (error) {
      if (axios.isCancel(error)) return;
    }
  }

  async function deleteSlip(id) {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.LOGIN_INFO,
        },
      };

      const res = await axios.get(
        `${baseURL}/user/unlink_slip?id=${id}`,
        config
      );

      if (!res.data.error) {
        dispatch({
          type: "GET_PAYSLIP",
          payload: false,
        });
      }
    } catch (error) {
      if (axios.isCancel(error)) return;
    }
  }

  async function getPNine(year, emp) {
    const info = tokenInfo();

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.LOGIN_INFO,
        },
      };

      const res = await axios.get(
        `${baseURL}/user/p_nine?username=${info.data.username}&year=${year}&emp_no=${emp}`,
        config
      );

      // console.log(res.data);

      if (!res.data.error) {
        dispatch({
          type: "LOAD_PNINE_LIST",
          payload: res.data.file_list,
        });

        unsetP9(true);
      } else {
        dispatch({
          type: "LOAD_PNINE_LIST",
          payload: [],
        });

        unsetP9(false);
      }
    } catch (error) {
      if (axios.isCancel(error)) return;
    } finally {
      loadingStatus(false);
    }
  }

  function checkUserCompany(username) {
    const match = username.match(/@(.*?)\./);

    if (match && match[1]) {
      const result = match[1];
      return result.toString();
    } else {
      return null;
    }
  }

  async function getPaySlip(date, emp, company) {
    loadingStatus(true);

    const info = tokenInfo();
    let employeeNumber =
      emp ||
      state.user_info.EmployeeNumber ||
      state.user_info.employeeNumber ||
      state.leave_info.empNo ||
      state.leave_info.EmployeeNumber ||
      state.leave_info.employeeNumber ||
      "";

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.LOGIN_INFO,
        },
      };

      // The payslip page can be submitted before the asynchronous profile
      // requests finish. Resolve the employee number from the leave endpoint
      // before requesting the payslip instead of sending emp_no=.
      if (!employeeNumber && info && info.data && info.data.username) {
        const leaveResponse = await axios.get(
          `${baseURL}/leave/info?email=${encodeURIComponent(info.data.username)}`,
          config
        );
        const leaveData = leaveResponse.data && leaveResponse.data.data;
        employeeNumber =
          (leaveData &&
            (leaveData.empNo ||
              leaveData.EmployeeNumber ||
              leaveData.employeeNumber)) ||
          "";
      }

      if (!employeeNumber) {
        throw new Error("Could not determine the employee number for this payslip.");
      }

      const res = await axios.get(
        `${baseURL}/user/slip?username=${encodeURIComponent(
          info.data.username
        )}&date_filter=${encodeURIComponent(
          date
        )}&emp_no=${encodeURIComponent(employeeNumber)}&company=${encodeURIComponent(
          company
        )}`,
        config
      );

      // console.log(res.data.error);

      dispatch({
        type: "LOAD_PAYSLIP_LIST",
        payload: Number(res.data && res.data.file_list) || 0,
      });

      // A successful response may contain no files, but it is still the
      // completed results state and must not leave the form stuck loading.
      unsetSlip(true);
    } catch (error) {
      if (axios.isCancel(error)) return;
    } finally {
      loadingStatus(false);
    }
  }

  async function getJobVacancies() {
    loadingStatus(!state.isLoading ? true : false);

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.LOGIN_INFO,
        },
      };
      const res = await axios.get(`${baseURL}/jobs/all`, config);

      if (!res.data.error) {
        dispatch({
          type: "GET_JOBS",
          payload: res.data.data,
        });
      }
    } catch (error) {
      if (axios.isCancel(error)) return;
    }

    loadingStatus(false);
  }

  async function getJobVacancy(reqNo) {
    loadingStatus(!state.isLoading ? true : false);

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.LOGIN_INFO,
        },
      };
      const res = await axios.get(
        `${baseURL}/jobs/details?reqNo=${reqNo}`,
        config
      );

      if (!res.data.error) {
        dispatch({
          type: "GET_JOB",
          payload: res.data.data,
        });

        loadingStatus(false);
      }
    } catch (error) {
      if (axios.isCancel(error)) return;
    }

    loadingStatus(false);
  }

  const sendApplication = async ({ jobId, message }) => {
    // call API...
    return true;
  };

  async function getUserVoucherDetails() {
    loadingStatus(!state.isLoading ? true : false);

    const info = tokenInfo();

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.LOGIN_INFO,
        },
      };
      const res = await axios.get(
        `${baseURL}/voucher/selection?email=${info.data.username}`,
        config
      );

      if (!res.data.error) {
        dispatch({
          type: "GET_VOUCHER_DETAILS",
          payload: res.data.data,
        });
      }
    } catch (error) {
      if (axios.isCancel(error)) return;
    }

    loadingStatus(false);
  }

  async function updateSupermarketSelection(inputs) {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.LOGIN_INFO,
        },
      };

      const res = await axios.post(`${baseURL}/voucher/update`, inputs, config);

      if (!res.data.error) {
        setMessage(res.data.message);
        return { ok: true, data: res.data };
      }
      return { ok: false, data: res.data };
    } catch (error) {
      if (axios.isCancel(error)) return { ok: false, cancelled: true };
      return { ok: false, error };
    }
  }

  async function getLeaveDetails() {
    const leave_details = Cookies.get("__leave_details");

    if (leave_details) {
      dispatch({
        type: "GET_LEAVE_INFO",
        payload: decryptData(leave_details),
      });
    } else {
      loadingStatus(!state.isLoading ? true : false);

      const info = tokenInfo();

      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.LOGIN_INFO,
          },
        };
        const res = await axios.get(
          `${baseURL}/leave/info?email=${info.data.username}`,
          config
        );
        if (!res.data.error) {
          addCookie(encryptData(res.data.data), "__leave_details");
          dispatch({
            type: "GET_LEAVE_INFO",
            payload: res.data.data,
          });
        }
      } catch (error) {
        if (axios.isCancel(error)) return;
      }
    }

    loadingStatus(false);
  }

  async function getLeaveHistory() {
    const leave_history = Cookies.get("__leave_history");

    if (leave_history) {
      dispatch({
        type: "GET_LEAVE_HISTORY",
        payload: decryptData(leave_history),
      });
    } else {
      loadingStatus(!state.isLoading ? true : false);

      const info = tokenInfo();

      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.LOGIN_INFO,
          },
        };
        const res = await axios.get(
          `${baseURL}/leave/history?email=${info.data.username}`,
          config
        );

        if (!res.data.error) {
          addCookie(encryptData(res.data.data), "__leave_history");
          dispatch({
            type: "GET_LEAVE_HISTORY",
            payload: res.data.data,
          });

          //check if manage and call approvals
          if (info.data.role === 1) {
            getLeaveApprovals();
          }
        }
      } catch (error) {
        if (axios.isCancel(error)) return;
      } finally {
        loadingStatus(false);
      }
    }
  }

  async function applyForOutOfOffice(inputs) {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.LOGIN_INFO,
        },
      };

      const res = await axios.post(
        `${baseURL}/out_of_office/apply`,
        inputs,
        config
      );

      if (!res.data.error) {
        Cookies.remove("__leave_history");
        getLeaveHistory();
        setMessage(res.data.message);
      }
    } catch (error) {
      if (axios.isCancel(error)) return;
    }
  }

  async function applyForLeave(inputs) {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.LOGIN_INFO,
        },
      };

      const res = await axios.post(`${baseURL}/leave/apply`, inputs, config);

      if (!res.data.error) {
        Cookies.remove("__leave_history");
        getLeaveHistory();
        setMessage(res.data.message);
      }
    } catch (error) {
      if (axios.isCancel(error)) return;
    }
  }

  // async function attachDocument(file, staff, ext, username) {
  //   console.log("Usijinyime bradhe");
  // }

  async function uploadProfile(file, staff, ext, username) {
    //SAVES TO CLOUD...................................................................
    // formData.append("file", file);
    // formData.append("upload_preset", "zPre53t101");
    // formData.append("cloud_name", "mandelamanscloud");
    // const res = await axios.post(
    //   `https://api.cloudinary.com/v1_1/mandelamanscloud/image/upload`,
    //   formData,
    //   {
    //     headers: {
    //       "Content-Type": "multipart/form-data",
    //     },
    //   }
    // );
    // SAVES TO IIS..................................................................
    const formData = new FormData();

    formData.append("avatar", file);
    formData.append("staff", staff);
    formData.append("extension", ext);
    const res = await axios.post(
      `${baseURL}/user/profile_picture_upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: localStorage.LOGIN_INFO,
        },
      }
    );

    if (!res.data.error) {
      return true;
    } else {
      return false;
    }
  }

  async function mainUpdate(inputs) {
    // if (!localStorage.hasOwnProperty("update_code")) {
    //   let uuid = uuidv4();

    //   localStorage.update_code = uuid;
    // }

    // inputs.unique_code = localStorage.update_code;

    inputs.docNo = state.user_info_to_update.docNo;

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.LOGIN_INFO,
      },
    };

    const res = await axios.post(`${baseURL}/user/update`, inputs, config);

    return res.data;
  }

  async function updateProfile(inputs) {
    dispatch({
      type: "SET_UPDATE_PROFILE",
      payload: true,
    });

    if (typeof inputs.picture !== "undefined") {
      const extension = inputs.picture.name.split(".")[1];
      uploadProfile(
        inputs.picture,
        state.user_info.EmployeeNumber,
        extension,
        inputs.username
      );
    }

    try {
      const results = await mainUpdate(inputs);

      if (!results.error) {
        inputs.docNo = state.user_info_to_update.docNo;

        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.LOGIN_INFO,
          },
        };

        await axios.post(`${baseURL}/user/update`, inputs, config);

        dispatch({
          type: "SET_UPDATE_PROFILE",
          payload: false,
        });

        loadingStatus(false);

        sectionUpdating(false);
      }
    } catch (error) {
      if (axios.isCancel(error)) return;
    }

    dispatch({
      type: "SET_UPDATE_PROFILE",
      payload: false,
    });
  }

  // async function updateProfile(inputs) {
  //   if (typeof inputs.picture !== "undefined") {
  //     const extension = inputs.picture.name.split(".")[1];
  //     uploadProfile(inputs.picture, inputs.staff, extension, inputs.username);
  //   }

  //   // try {
  //   //   const config = {
  //   //     headers: {
  //   //       "Content-Type": "application/json",
  //   //       Authorization: localStorage.LOGIN_INFO,
  //   //     },
  //   //   };
  //   //   const res = await axios.post(
  //   //     `${baseURL}/user/edit_profile`,
  //   //     inputs,
  //   //     config
  //   //   );
  //   //   console.log(res);
  //   //   Cookies.remove("__details");
  //   //   getUserDetails();
  //   // } catch (error) {}
  // }

  async function allTickets() {
    const ticket_details = Cookies.get("__ticket_details");

    if (ticket_details) {
      dispatch({
        type: "GET_TICKETS",
        payload: decryptData(ticket_details),
      });
    } else {
      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.LOGIN_INFO,
          },
        };

        const res = await axios.get(`${baseURL}/ticketing/all`, config);

        if (!res.data.error && res.data.data != null) {
          addCookie(encryptData(res.data.data), "__ticket_details");
          dispatch({
            type: "GET_TICKETS",
            payload: res.data.data,
          });
        }
      } catch (error) {
        if (axios.isCancel(error)) return;
      }
    }
  }

  async function raiseTicket(inputs) {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.LOGIN_INFO,
        },
      };

      const res = await axios.post(
        `${baseURL}/ticketing/create`,
        inputs,
        config
      );

      if (!res.data.error) {
        //console.log(res);
        Cookies.remove("__my_tickets");
        allTickets();
      }
    } catch (error) {
      if (axios.isCancel(error)) return;
    }
  }

  async function addDependent(inputs) {
    dispatch({
      type: "SET_UPDATE_PROFILE",
      payload: true,
    });

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.LOGIN_INFO,
        },
      };

      const res = await axios.post(
        `${baseURL}/user/add_dependent`,
        inputs,
        config
      );

      if (!res.data.error) {
        getAllDependents();

        dispatch({
          type: "SET_UPDATE_PROFILE",
          payload: false,
        });
      }
    } catch (error) {
      if (axios.isCancel(error)) return;
    }
  }

  async function addNextOfKin(inputs) {
    dispatch({
      type: "SET_UPDATE_PROFILE",
      payload: true,
    });

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.LOGIN_INFO,
        },
      };

      const res = await axios.post(
        `${baseURL}/user/add_next_of_kin`,
        inputs,
        config
      );

      if (!res.data.error) {
        getAllNextOfKin();

        dispatch({
          type: "SET_UPDATE_PROFILE",
          payload: false,
        });
      }
    } catch (error) {
      if (axios.isCancel(error)) return;
    }
  }

  async function getAllDependents() {
    dispatch({
      type: "SET_UPDATE_PROFILE",
      payload: true,
    });

    const user_info = JSON.parse(localStorage._buffer_user_info);

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.LOGIN_INFO,
        },
      };

      const res = await axios.get(
        `${baseURL}/user/get_dependents?username=${user_info.CompanyEmail}&code=${user_info.docNo}`,
        config
      );

      dispatch({
        type: "GET_DEPENDENTS",
        payload: res.data.data,
      });

      dispatch({
        type: "SET_UPDATE_PROFILE",
        payload: false,
      });
    } catch (error) {
      if (axios.isCancel(error)) return;
    }
  }

  async function getAllNextOfKin() {
    dispatch({
      type: "SET_UPDATE_PROFILE",
      payload: true,
    });

    const user_info = JSON.parse(localStorage._buffer_user_info);

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.LOGIN_INFO,
        },
      };

      const res = await axios.get(
        `${baseURL}/user/get_next_of_kin?username=${user_info.CompanyEmail}&code=${user_info.docNo}`,
        config
      );

      dispatch({
        type: "GET_NEXT_OF_KIN",
        payload: res.data.data,
      });

      dispatch({
        type: "SET_UPDATE_PROFILE",
        payload: false,
      });
    } catch (error) {
      if (axios.isCancel(error)) return;
    }

    // const kin_details = Cookies.get("__kin_details");

    // if (kin_details) {
    //   dispatch({
    //     type: "GET_NEXT_OF_KIN",
    //     payload: decryptData(kin_details),
    //   });
    // } else {
    //   const info = tokenInfo();
    //   try {
    //     const config = {
    //       headers: {
    //         "Content-Type": "application/json",
    //         Authorization: localStorage.LOGIN_INFO,
    //       },
    //     };

    //     const res = await axios.get(
    //       `${baseURL}/user/get_next_of_kin?username=${info.data.username}`,
    //       config
    //     );

    //     if (!res.data.error && res.data.data != null) {
    //       // console.log(res.data.data);
    //       addCookie(encryptData(res.data.data), "__kin_details");
    //       dispatch({
    //         type: "GET_NEXT_OF_KIN",
    //         payload: res.data.data,
    //       });
    //     }
    //   } catch (error) {}
    // }
  }

  // async function getReturnDate(start_date, duration, type) {
  //   try {
  //     const config = {
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: localStorage.LOGIN_INFO,
  //       },
  //     };
  //     const res = await axios.get(
  //       `${baseURL}/leave/return_leave_date?start_date=${start_date}&type=${type}&duration=${duration}`,
  //       config
  //     );

  //     console.log(res);

  //     if (!res.data.error) {
  //       addCookie(encryptData(res.data.data), "__leave_approvals");
  //       dispatch({
  //         type: "GET_LEAVE_APPROVALS",
  //         payload: res.data.data,
  //       });
  //     }
  //   } catch (error) {}
  // }

  async function getLeaveApprovals() {
    // console.log("get approvals");
    const info = tokenInfo();

    if (info && info.data.role > 0) {
      const leave_approvals = Cookies.get("__leave_approvals");

      if (leave_approvals) {
        dispatch({
          type: "GET_LEAVE_APPROVALS",
          payload: decryptData(leave_approvals),
        });
      } else {
        try {
          const config = {
            headers: {
              "Content-Type": "application/json",
              Authorization: localStorage.LOGIN_INFO,
            },
          };
          const res = await axios.get(
            // `${baseURL}/leave/approvals?email=${info.data.username}`,
            `${baseURL}/leave/approvals?email=nafazal@micglobalrisks.com`,
            config
          );

          if (!res.data.error && res.data.data != null) {
            addCookie(encryptData(res.data.data), "__leave_approvals");
            dispatch({
              type: "GET_LEAVE_APPROVALS",
              payload: res.data.data,
            });
          }
        } catch (error) {
          if (axios.isCancel(error)) return;
        }
      }
    }
  }

  async function approveLeave(leave_no, action) {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.LOGIN_INFO,
        },
      };
      const res = await axios.get(
        `${baseURL}/leave/requests?leave_no=${leave_no}&action=${action}`,
        config
      );

      if (!res.data.error) {
        Cookies.remove("__leave_approvals");
        getLeaveApprovals();
      }
    } catch (error) {
      if (axios.isCancel(error)) return;
    }
  }

  // ...............................START OF Appraisal Funtions.......................................... //
  const generateAppraisalCode = async () => {
    let appraisal_code = Cookies.get("appraisal_code");

    const info = tokenInfo();

    if (!info) return null;

    const email = info.data.username;

    if (appraisal_code === undefined || appraisal_code === null) {
      try {
        const response = await fetch(`${baseURL}/appraisal/create`, {
          method: "POST",
          mode: "cors",
          headers: {
            // Authorization: `Bearer ${result.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });

        const results = await response.json();

        addCookie(results.data.appraisalNo, "appraisal_code");

        appraisal_code = results.data.appraisalNo;
      } catch (e) {
        return null;
      }
    }

    return appraisal_code;
  };

  const submitObjective = async (inputs) => {
    inputs.supervisor_comments = "";

    try {
      const response = await fetch(`${baseURL}/appraisal/add_objective`, {
        method: "POST",
        mode: "cors",
        headers: {
          // Authorization: `Bearer ${result.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inputs),
      });

      const results = await response.json();

      if (!results.error) {
        getObjectives();
      }

      return true;
    } catch (e) {
      return null;
    }
  };

  const getObjectives = async () => {
    const user_info = JSON.parse(localStorage._buffer_user_info);

    try {
      const response = await fetch(
        `${baseURL}/appraisal/objectives?email=${user_info.CompanyEmail}`,
        {
          method: "GET",
          mode: "cors",
          headers: {
            // Authorization: `Bearer ${result.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const results = await response.json();

      if (!results.error) {
        dispatch({
          type: "GET_ALL_OBJECTIVES",
          payload: results.data,
        });
      }

      return true;
    } catch (e) {
      return null;
    }
  };

  const getTeamObjectives = async () => {
    let team_dummy_objectives = [
      {
        id: 1,
        title: "Objective Title Example",
        description: "This will be the description for the set objective",
        year: 2023,
        weight: 0,
        effective_period: "Q4",
        comments: "Ensure module is integrated with the cliams section",
        rating: 1,
        status: 2, // 1- approved, 2 - pending, 3 - rejected
        appraisee_comments:
          "Course requires some time off work for exams and assesment tasks",
        supervisor_comments: "",
        member: "Nelson Omoro",
      },
      {
        id: 2,
        title: "Objective Title Example",
        description: "This will be the description for the set objective",
        year: 2023,
        weight: 0,
        effective_period: "Q4",
        comments: "Ensure module is integrated with the cliams section",
        rating: 3,
        status: 2, // 1- approved, 2 - pending, 3 - rejected
        appraisee_comments:
          "Course requires some time off work for exams and assesment tasks",
        supervisor_comments: "",
        member: "Dennis Kithinji",
      },
      {
        id: 2,
        title: "Objective Title Example",
        description: "This will be the description for the set objective",
        year: 2023,
        weight: 0,
        effective_period: "Q4",
        comments: "Ensure module is integrated with the cliams section",
        rating: 3,
        status: 2, // 1- approved, 2 - pending, 3 - rejected
        appraisee_comments:
          "Course requires some time off work for exams and assesment tasks",
        supervisor_comments: "",
        member: "Amos Ngure",
      },
    ];

    dispatch({
      type: "GET_ALL_TEAM_OBJECTIVES",
      payload: team_dummy_objectives,
    });
  };

  const submitNeed = async (inputs) => {
    inputs.supervisor_comments = "";

    try {
      const response = await fetch(
        `${baseURL}/appraisal/add_development_need`,
        {
          method: "POST",
          mode: "cors",
          headers: {
            // Authorization: `Bearer ${result.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(inputs),
        }
      );

      const results = await response.json();

      if (!results.error) {
        getDevelopmentNeeds();
      }

      return true;
    } catch (e) {
      return null;
    }
  };

  const getDevelopmentNeeds = async () => {
    const user_info = JSON.parse(localStorage._buffer_user_info);

    try {
      const response = await fetch(
        `${baseURL}/appraisal/developments?email=${user_info.CompanyEmail}`,
        {
          method: "GET",
          mode: "cors",
          headers: {
            // Authorization: `Bearer ${result.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const results = await response.json();

      if (!results.error) {
        dispatch({
          type: "GET_ALL_DEVELOPMENT_NEEDS",
          payload: results.data,
        });
      }

      return true;
    } catch (e) {
      return null;
    }
  };

  const getTeamDevelopmentNeeds = async () => {
    let result = await generateAppraisalCode();

    let team_dummy_needs = [
      {
        id: 1,
        course: "Learn Mobile Development",
        learning_obtained:
          "Develop mobile applications to be used by customers to access company services",
        timeline: "2 weeks",
        learning_resource: 1, //Institution type
        start_date: "12/05/2023",
        end_date: "12/08/2023",
        institution: "Admin Technical Institute",
        cost: 3000,
        year: 2023,
        appraisee_comments:
          "Course requires some time off work for exams and assesment tasks",
        supervisor_comments: "",
        results_obtained: {
          score: "",
          certification: "",
        },
        status: 2,
      },
      {
        id: 1,
        course: "Learn Kafka",
        learning_obtained:
          "Develop mobile applications to be used by customers to access company services",
        timeline: "2 weeks",
        learning_resource: 1, //Institution type
        start_date: "12/05/2023",
        end_date: "12/08/2023",
        institution: "Admin Technical Institute",
        cost: 3000,
        year: 2023,
        appraisee_comments:
          "Course requires some time off work for exams and assesment tasks",
        supervisor_comments: "",
        results_obtained: {
          score: "",
          certification: "",
        },
        status: 2,
      },
      {
        id: 3,
        course: "Learn Public Speaking",
        learning_obtained: "Obtain skills to perform training",
        timeline: "2 weeks",
        learning_resource: 1, //Institution type
        start_date: "12/05/2023",
        end_date: "12/08/2023",
        institution: "In-house Training",
        cost: 3000,
        year: 2023,
        appraisee_comments: "",
        supervisor_comments: "",
        results_obtained: {
          score: "",
          certification: "",
        },
        status: 2,
      },
    ];

    dispatch({
      type: "GET_ALL_TEAM_DEVELOPMENT_NEEDS",
      payload: team_dummy_needs,
    });

    console.log(result);
  };

  // ...............................END OF Appraisal Funtions.......................................... //

  async function handleLogout() {
    localStorage.clear();

    dispatch({
      type: "LOG_OUT",
    });

    Cookies.remove("__details");
    Cookies.remove("__dependent_details");
    Cookies.remove("__kin_details");
    Cookies.remove("__leave_details");
    Cookies.remove("__leave_history");
    Cookies.remove("__leave_approvals");
    Cookies.remove("__ehs_staff");
    Cookies.remove("__mic_staff");
    Cookies.remove("appraisal_code");
    Cookies.remove("refresh_token");

    loadingStatus(false);

    setMessage();
    //window.location.reload();
  }

  const getAccessToken = async (inputs) => {
    // try {
    //   const response = await fetch(`${baseURL}/auth/refresh`, {
    //     method: "GET",
    //     mode: "cors",
    //     headers: {
    //       Authorization: `${token}`,
    //       "Content-Type": "application/json",
    //     },
    //   });

    //   const access_token = await response.json();

    //   return access_token;
    // } catch (e) {
    //   return null;
    // }
  };

  useEffect(() => {
    // setGlobalInfo();
    loginStatus();

    getAccessToken();

    return () => {
      dispatch({
        type: "SET_LOADING",
        payload: null,
      });
    }; // eslint-disable-next-line
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        loadingStatus,
        loginStatus,
        handleLogin,
        devLogin,
        handleLogout,
        setMessage,
        updatePassword,
        checkUsername,
        getLeaveDetails,
        applyForLeave,
        applyForOutOfOffice,
        getUserDetails,
        getLeaveHistory,
        getLeaveApprovals,
        approveLeave,
        addNextOfKin,
        getEhsStaff,
        getMicStaff,
        updateProfile,
        // getReturnDate,
        getAllDependents,
        addDependent,
        getAllNextOfKin,
        getPaySlip,
        deleteSlip,
        getPNine,
        getNotifications,
        unsetSlip,
        unsetP9,
        raiseTicket,
        allTickets,
        addQualification,
        getQualifications,
        checkUpdateStatus,
        userDetailsToUpdate,
        sectionUpdating,
        deleteP9,
        generateAppraisalCode,
        submitObjective,
        submitNeed,
        getObjectives,
        getDevelopmentNeeds,
        getTeamDevelopmentNeeds,
        getTeamObjectives,
        checkUserCompany,
        getUserVoucherDetails,
        updateSupermarketSelection,
        getJobVacancies,
        getJobVacancy,
        sendApplication,

        access_token: state.access_token,
        user_info_to_update: state.user_info_to_update,
        update_status: state.update_status,
        isUpdatingProfile: state.isUpdatingProfile,
        downloadSlip: state.downloadSlip,
        downloadP9: state.downloadP9,
        payslips: state.payslips,
        p_nine: state.p_nine,
        ehs_staff: state.ehs_staff,
        mic_staff: state.mic_staff,
        next_of_kin: state.next_of_kin,
        globals: state.globals,
        dependant_info: state.dependant_info,
        leave_approvals: state.leave_approvals,
        privilege: state.privilege,
        leave_history: state.leave_history,
        user_info: state.user_info,
        leave_info: state.leave_info,
        userCheck: state.userCheck,
        passwordCheck: state.passwordCheck,
        isLoading: state.isLoading,
        message: state.message,
        shouldChangePassword: state.shouldChangePassword,
        isLoggedin: state.isLoggedin,
        notifications: state.notifications,
        tickets: state.tickets,
        qualifications: state.qualifications,
        objectives: state.objectives,
        developments: state.developments,
        team_objectives: state.team_objectives,
        team_developments: state.team_developments,
        voucher: state.voucher,
        vacancies: state.vacancies,
        vacancy: state.vacancy,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

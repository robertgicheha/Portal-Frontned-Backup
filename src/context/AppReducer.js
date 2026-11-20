const AppReducer = (state, action) => {
  // console.log("state ", state);
  // console.log("action", action.type);
  // console.log("payload", action.payload);

  switch (action.type) {
    case "SET_PROFILE_UPDATE_STATUS":
      return {
        ...state,
        update_status: action.payload,
      };
    case "GET_TICKETS":
      return {
        ...state,
        tickets: action.payload,
      };
    case "SET_GLOBAL_INFO":
      return {
        ...state,
        globals: action.payload,
      };
    case "GET_NOTIFICATIONS":
      return {
        ...state,
        notifications: action.payload,
      };
    case "GET_QUALIFICATIONS":
      return {
        ...state,
        qualifications: action.payload,
      };
    case "SET_UPDATE_PROFILE":
      return {
        ...state,
        isUpdatingProfile: action.payload,
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };
    case "CHECK_USER":
      const { userchecked, updatepass } = action.payload;
      return {
        ...state,
        userCheck: userchecked,
        shouldChangePassword: updatepass,
      };
    case "LOG_STATUS":
      return {
        ...state,
        isLoggedin: action.payload,
      };
    case "LOG_OUT":
      return {
        ...state,
        isLoggedin: false,
        userCheck: false,
      };
    case "CHANGE_PASSWORD":
      return {
        ...state,
        shouldChangePassword: action.payload,
      };
    case "MESSAGE":
      return {
        ...state,
        message: action.payload,
      };
    case "GET_LEAVE_INFO":
      return {
        ...state,
        // The profile page reads fields straight off this object, so a null /
        // non-object payload (e.g. no leave record for an EHS employee) must
        // never replace it -- that crashed the page.
        leave_info:
          action.payload && typeof action.payload === "object"
            ? action.payload
            : {},
      };
    case "GET_LEAVE_HISTORY":
      return {
        ...state,
        leave_history: action.payload,
      };
    case "GET_ALL_EHS_STAFF":
      return {
        ...state,
        ehs_staff: action.payload,
      };
    case "GET_ALL_MIC_STAFF":
      return {
        ...state,
        mic_staff: action.payload,
      };
    case "GET_NEXT_OF_KIN":
      return {
        ...state,
        next_of_kin: action.payload,
      };
    case "GET_LEAVE_APPROVALS":
      return {
        ...state,
        leave_approvals: action.payload,
      };
    case "GET_USER_INFO":
      return {
        ...state,
        // The profile page reads fields straight off this object, so a null /
        // non-object payload (e.g. no leave record for an EHS employee) must
        // never replace it -- that crashed the page.
        user_info:
          action.payload && typeof action.payload === "object"
            ? action.payload
            : {},
      };
    case "GET_USER_INFO_TO_UPDATE":
      return {
        ...state,
        // The profile page reads fields straight off this object, so a null /
        // non-object payload (e.g. no leave record for an EHS employee) must
        // never replace it -- that crashed the page.
        user_info_to_update:
          action.payload && typeof action.payload === "object"
            ? action.payload
            : {},
      };

    case "SET_PRIVILEGE":
      return {
        ...state,
        privilege: action.payload,
      };
    case "GET_DEPENDENTS":
      return {
        ...state,
        dependant_info: action.payload,
      };
    case "GET_PAYSLIP":
      return {
        ...state,
        downloadSlip: action.payload,
      };
    case "LOAD_PAYSLIP_LIST":
      return {
        ...state,
        payslips: action.payload,
      };

    case "GET_PNINE":
      return {
        ...state,
        downloadP9: action.payload,
      };
    case "LOAD_PNINE_LIST":
      return {
        ...state,
        p_nine: action.payload,
      };
    case "SET_ACCESS_TOKEN":
      return {
        ...state,
        access_token: action.payload,
      };
    case "GET_ALL_OBJECTIVES":
      return {
        ...state,
        objectives: action.payload,
      };
    case "GET_ALL_DEVELOPMENT_NEEDS":
      return {
        ...state,
        developments: action.payload,
      };
    case "GET_ALL_TEAM_OBJECTIVES":
      return {
        ...state,
        team_objectives: action.payload,
      };
    case "GET_ALL_TEAM_DEVELOPMENT_NEEDS":
      return {
        ...state,
        team_developments: action.payload,
      };
    case "GET_VOUCHER_DETAILS":
      return {
        ...state,
        voucher: action.payload,
      };
    case "GET_JOBS":
      return {
        ...state,
        vacancies: action.payload,
      };
    case "GET_JOB":
      return {
        ...state,
        vacancy: action.payload,
      };
    default:
      return state;
  }
};

export default AppReducer;

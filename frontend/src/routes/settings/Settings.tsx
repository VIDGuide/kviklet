import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import BaseSettingsLayout, { Tab } from "./BaseSettingsLayout";
import { Link, Route, Routes, useLocation } from "react-router-dom";

export const Settings = () => {
  const location = useLocation();
  console.log(location.pathname);
  const tabStyles =
    "flex flex-row items-center justify-left text-slate-700 dark:text-slate-50 text-sm p-1";
  const tabs = [
    {
      name: "databases",
      tabContent: (
        <div className="flex flex-col">
          <div className={tabStyles}>
            <FontAwesomeIcon icon={solid("database")} className="mr-2" />
            Databases
          </div>
        </div>
      ),
      link: "/settings/databases",
    },
    {
      name: "users",
      tabContent: (
        <div className="flex flex-col">
          <div className={tabStyles}>
            <FontAwesomeIcon icon={solid("user")} className="mr-2" />
            Users
          </div>
        </div>
      ),
      link: "/settings/users",
    },
    {
      name: "roles",
      tabContent: (
        <div className="flex flex-col">
          <div className={tabStyles}>
            <FontAwesomeIcon icon={solid("users")} className="mr-2" />
            Roles
          </div>
        </div>
      ),
      link: "/settings/roles",
    },
  ];
  return <BaseSettingsLayout tabs={tabs}></BaseSettingsLayout>;
};

export default Settings;

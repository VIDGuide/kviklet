import React, { useEffect, useState } from "react";
import Button from "../../components/Button";
import {
  UserResponse,
  createUser,
  fetchUsers,
  updateUser,
} from "../../api/UserApi";
import InputField from "../../components/InputField";
import Modal from "../../components/Modal";
import { useRoles } from "./RolesSettings";
import { RoleResponse } from "../../api/RoleApi";
import ColorfulLabel from "../../components/ColorfulLabel";
import { isApiErrorResponse } from "../../api/Errors";
import { Error, Success } from "../../components/Alert";

function UserForm(props: {
  disableModal: () => void;
  createNewUser: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const saveUser = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    props
      .createNewUser(email, password, fullName)
      .then(() => {
        props.disableModal();
      })
      .catch((err) => console.log(err));
  };

  return (
    <form method="post" onSubmit={saveUser}>
      <div className="w-2xl shadow p-3 bg-white dark:bg-slate-950 rounded">
        <div className="flex flex-col mb-3">
          <InputField
            id="email"
            label="Email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
          />
        </div>
        <div className="flex flex-col mb-3">
          <InputField
            id="password"
            label="Password"
            type="passwordlike"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
          />
        </div>
        <div className="flex flex-col mb-3">
          <InputField
            id="fullName"
            label="Full Name"
            value={fullName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFullName(e.target.value)
            }
          />
        </div>
        <div className="flex flex-col mb-3">
          <Button className="ml-auto" type="submit">
            Create
          </Button>
        </div>
      </div>
    </form>
  );
}

export const useUsers = () => {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function clearNotifications() {
    setTimeout(() => {
      setError("");
      setSuccess("");
    }, 5000);
  }

  useEffect(() => {
    async function request() {
      const apiUsers = await fetchUsers();
      setUsers(apiUsers);
    }
    void request();
  }, []);

  async function addRoleToUser(userId: string, roleId: string) {
    const currentUser = users.find((u) => u.id === userId);
    if (!currentUser) {
      return;
    }
    const newUser = await updateUser(userId, {
      roles: [...currentUser.roles.map((g) => g.id), roleId],
    });
    setUsers(users.map((u) => (u.id === userId ? newUser : u)));
    setSuccess("Role added");
  }

  async function createNewUser(
    email: string,
    password: string,
    fullName: string,
  ) {
    try {
      const userResponse = await createUser({
        email: email,
        password: password,
        fullName: fullName,
      });
      if (isApiErrorResponse(userResponse)) {
        setError(userResponse.message);
      } else {
        setUsers([...users, userResponse]);
        setSuccess(`User created for email ${userResponse.email}`);
      }
    } catch (err) {
      setError("Something went wrong");
    }
    clearNotifications();
  }

  async function removeRoleFromUser(userId: string, roleId: string) {
    const currentUser = users.find((u) => u.id === userId);
    if (!currentUser) {
      return;
    }
    const newUser = await updateUser(userId, {
      roles: currentUser.roles.filter((g) => g.id !== roleId).map((g) => g.id),
    });
    setUsers(users.map((u) => (u.id === userId ? newUser : u)));
    setSuccess("Role removed");
  }

  return {
    addRoleToUser,
    users,
    createNewUser,
    removeRoleFromUser,
    error,
    success,
  };
};

const UserRow = (props: {
  user: UserResponse;
  roles: RoleResponse[];
  addRoleToUser: (userId: string, roleId: string) => Promise<void>;
  removeRoleFromUser: (userId: string, roleId: string) => Promise<void>;
}) => {
  const [rolesDialogVisible, setRolesDialogVisible] = useState(false);

  return (
    <div className="flex flex-row">
      <div className="flex flex-row justify-between w-full shadow-sm p-2">
        <div className="flex flex-row w-1/3">
          <div className="font-bold">{props.user.fullName}</div>
        </div>
        <div className="flex flex-row text-slate-400 w-1/3">
          <div>{props.user.email}</div>
        </div>
        <div className="flex flex-row w-1/3 flex-wrap justify-end">
          {props.user.roles.map((role) => {
            return (
              <ColorfulLabel
                onDelete={() => {
                  void props.removeRoleFromUser(props.user.id, role.id);
                }}
                text={role.name}
              />
            );
          })}
          <ColorfulLabel
            text="Add Role"
            onClick={() => {
              setRolesDialogVisible(true);
            }}
            color="dark:bg-slate-700 border border-slate-400"
          />
          {rolesDialogVisible && (
            <Modal setVisible={setRolesDialogVisible}>
              <div className="w-2xl shadow p-3 bg-white dark:bg-slate-950 rounded">
                <div className="flex flex-col mb-3">
                  <div className="font-bold">Add Role</div>
                </div>
                <div className="flex flex-col mb-3">
                  <div className="flex flex-row flex-wrap">
                    {props.roles.map((role) => {
                      return (
                        <ColorfulLabel
                          onClick={() =>
                            void (async () => {
                              await props.addRoleToUser(props.user.id, role.id);
                              setRolesDialogVisible(false);
                            })()
                          }
                          text={role.name}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </Modal>
          )}
        </div>
      </div>
    </div>
  );
};

const UserSettings = () => {
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const {
    addRoleToUser,
    users,
    createNewUser,
    removeRoleFromUser,
    error,
    success,
  } = useUsers();

  const { roles } = useRoles();

  return (
    <div>
      {error && (
        <div className="my-4 mx-2 px-4 py-2">
          <Error>{error}</Error>
        </div>
      )}
      {success && (
        <div className="my-4 mx-2 px-4 py-2">
          <Success>{success}</Success>
        </div>
      )}
      <div className="flex flex-col justify-between w-2/3 mx-auto">
        <div className="flex flex-col min-h-60">
          {users.map((user) => (
            <UserRow
              user={user}
              roles={roles}
              addRoleToUser={addRoleToUser}
              removeRoleFromUser={removeRoleFromUser}
            />
          ))}
        </div>
        <div className="flex">
          <Button
            className="ml-auto my-2"
            onClick={() => setShowCreateUserModal(true)}
          >
            Add User
          </Button>
        </div>
        {showCreateUserModal && (
          <Modal setVisible={setShowCreateUserModal}>
            <UserForm
              disableModal={() => setShowCreateUserModal(false)}
              createNewUser={createNewUser}
            />
          </Modal>
        )}
      </div>
    </div>
  );
};

export default UserSettings;

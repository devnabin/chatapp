from config import settings
import json

class UsersLoggedIn:
    databasedata = []
    activeUsers = []

    def __init__(self,db_path) -> None:
        self.db_path = db_path

    def load_dataset(self):
        try:
            with open(self.db_path, 'rt') as fs:
                activeUsers = fs.read()
                if activeUsers:
                    self.databasedata = json.loads(activeUsers)
                else:
                    fs = open(self.db_path, 'wt')
                    fs.write('[]')
                    fs.close()
        except:
            print('somthing went wrong')
        else:
            print("Database loaded successfully")
            # print(self.databasedata)

    def show_all_data(self):
        return self.databasedata

    def checkDetails(self, key, value):
        # check if the username is present on database or not
        is_present = any(key in list[value] for list in self.databasedata)

        if is_present: return True
    
        return False


    def createUser(self, user):
        user = dict(user)
        del user["confirmPassword"]

        self.databasedata.append(user)

        with open(self.db_path, 'wt') as fs:
            fs.write(json.dumps(self.databasedata))

        return True

    def userLoggin(self, user):
        current_user = [fuser for fuser in self.databasedata if fuser["username"] == user.username]
        # print(current_user)
        # print(user)
        if current_user:
            if user.password == current_user[0]["password"]:
                self.activeUsers.append(user.username)
                print('Active users' , self.activeUsers)
                return True

        return False




smallDB = UsersLoggedIn(settings.DATABASE)
smallDB.load_dataset()
# print(smallDB.show_all_data())


"""
@app.post("/login/{user_id}")
def login(user_id: int):
    database_user = get_user_from_database(user_id)

    current_user = ChatUser.from_dictionary(database_user)
    current_user.login()

    active_users[user_id] = current_user

    return {
        "message": "Login successful",
        "user_id": user_id,
    }


    @app.post("/logout/{user_id}")
def logout(user_id: int):
    current_user = active_users.pop(user_id, None)

    if current_user is None:
        return {"message": "User is not logged in"}

    current_user.logout()

    return {"message": "Logout successful"}

"""
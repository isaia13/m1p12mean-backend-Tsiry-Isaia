var user = null;
const setUser = function (utilisateurs) {
    user = utilisateurs;
}

const getUser = function () {
    return user;
}

module.exports = {setUser, getUser, user};
const multi_active = () => {
    let options = {
        usernames: [],
        services: getServices(),
        token: prompt('Введите токен')
    }

    var usernames = document.getElementById("username").value;

    usernames = usernames.split('\n');

    usernames.forEach(el => {
        if (el[0] === "@") {
            el = el.substring(1);
        }
        options.usernames.push(el);
    });

    if (options.usernames[0] === "" && options.usernames.length === 1) {
        alert('Вы не ввели ники');
        return;
    }

    if (services === undefined) {
        return;
    }

    axios.post('https://matrix.easy-stars.ru/bot/admin-panel/users/activate', options)
        .then((res) => {
            alert(res.data);
        })

}

const all_active = () => {
    let options = {
        all_users: true,
        services: getServices(),
        token: prompt('Введите токен')
    }

    if (services === undefined) {
        return;
    }

    axios.post('https://matrix.easy-stars.ru/bot/admin-panel/users/activate', options)
}

const multi_deactive = () => {
    let options = {
        usernames: [],
        services: getServices(),
        token: prompt('Введите токен')
    }

    var usernames = document.getElementById("username").value;

    usernames = usernames.split('\n');

    usernames.forEach(el => {
        if (el[0] === "@") {
            el = el.substring(1);
        }
        options.usernames.push(el);
    });

    if (options.usernames[0] === "" && options.usernames.length === 1) {
        alert('Вы не ввели ники');
        return;
    }

    if (services === undefined) {
        return;
    }

    axios.post('https://matrix.easy-stars.ru/bot/admin-panel/users/deactivate', options)

}

const all_deactive = () => {
    let options = {
        all_users: true,
        services: getServices(),
        token: prompt('Введите токен')
    }

    if (services === undefined) {
        return;
    }

    axios.post('https://matrix.easy-stars.ru/bot/admin-panel/users/deactivate', options)
}

const permutation = () => {
    let options = {
        usernames: getUsernames(),
        token: prompt('Введите токен')
    }

    axios.post('https://matrix.easy-stars.ru/bot/admin-panel/users/permutation', options)
}

const getServices = () => {
    var services = document.getElementById('services');

    services = services.getElementsByTagName('input')

    services_trasformed = {};

    all_serviced_not_checked = true;

    for (let i = 0; i < services.length; i++) {
        const el = services[i];

        services_trasformed[el.name] = el.checked;
    
        if (el.checked) {
            all_serviced_not_checked = false;
        }
    }

    if (all_serviced_not_checked) {
        alert('Вы не выбрали сервисы')
        return;
    }

    return services_trasformed;
}

const getUsernames = () => {
    var usernames = document.getElementById("username").value;

    usernames_el = usernames.split('\n');

    var usernames = [];

    usernames_el.forEach(el => {
        if (el[0] === "@") {
            el = el.substring(1);
        }
        usernames.push(el);
    });

    if (usernames[0] === "" && usernames.length === 1) {
        alert('Вы не ввели ники');
        return;
    }

    return usernames;
}

const accrual = () => {
    let options = {
        usernames: getUsernames(),
        amount: 0,
        services: getServices(),
        token: prompt('Введите токен')
    }

    options.amount = document.getElementById('amount').value;

    if (options.amount === '') {
        alert('Вы не ввели сумму');
    }

    axios.post('https://matrix.easy-stars.ru/bot/admin-panel/users/accrual', options);
}

const promo = () => {
    let options = {
        usernames: getUsernames(),
        type: getPackage(),
    }

    if (options.usernames !== undefined && options.type !== undefined) {
        options.token = prompt('Введите токен');
    } else {
        return;
    }

    axios.post('https://matrix.easy-stars.ru/bot/admin-panel/users/promo', options);
}

const getPackage = () => {
    var packages = document.getElementById('packages');

    packages = packages.getElementsByTagName('input')

    var all_packeges_not_checked = true;

    var package_type;

    for (let i = 0; i < packages.length; i++) {
        const el = packages[i];

        if (el.checked) {
            all_packeges_not_checked = false;
            package_type = el.value;
        }
    }

    if (all_packeges_not_checked) {
        alert('Вы не выбрали пакетов')
        return;
    }

    return package_type;
}
const transformByDeactivated = (tree) => {
    for (let i = 0; i < tree.children.length; i++) {
        if (!tree.children[i].active) {
            if (tree.children[i].children.length === 0) {
                tree.children.splice(i, 1);
                tree = transformByDeactivated(tree);

                continue;
            }
            tree.children[i] = deleteUser(tree.children[i]);
            tree = transformByDeactivated(tree);
            continue;
        }
        tree.children[i] = transformByDeactivated(tree.children[i]);
    }

    return tree;
};

const preTransformDelete = (tree) => {
    for (let i = 0; i < tree.children.length; i++) {
        if (!tree.children[i].active && tree.children[i].children.length === 0) {
            tree.children.splice(i, 1);
        }
    }
    for (let i = 0; i < tree.children.length; i++) {
        tree.children[i] = preTransformDelete(tree.children[i]);
    }
    return tree;
}

const deleteUser = (tree) => {
    let min = 0;

    //Нахожу ребёнка, с минимальным количеством детей
    for (let i = 0; i < tree.children.length; i++) {
        if (tree.children[i].children.length < tree.children[min].children.length) {
            min = i;
        }
    }
    //////////////////

    //это массив где должны быть дети нового пользователя
    let new_childs = [];

    for (let i = 0; i < tree.children.length; i++) {
        if (i !== min) {
            new_childs.push(tree.children[i]);
        }
    }

    if (tree.children.length === 0) {
        return tree;
    }

    //Самая пиздецовая часть, распределение детей по детям

    if (tree.children[min].children.length === 1) {
        new_childs.push(tree.children[min].children[0]);
    } else if (tree.children[min].children.length <= 5 - new_childs.length) {
        for (let i = 0; i < tree.children[min].children.length; i++) {
            new_childs.push(tree.children[min].children[i]);
        }
    } else {
        min_child = 0;

        for (let i = 0; i < tree.children[min].children.length; i++) {
            if (
                tree.children[min].children[i].children.length <
                tree.children[min].children[min_child].children.length
            ) {
                min_child = i;
            }
        }

        new_childs.push(deleteUser(tree.children[min].children[min_child]));
    }

    tree.children[min].children = new_childs;

    tree = tree.children[min];

    return tree;
};

module.exports = {transformByDeactivated, preTransformDelete};

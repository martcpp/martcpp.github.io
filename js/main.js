function create_tr(table_id) {
    let table_body = document.getElementById(table_id),
        first_tr   = table_body.firstElementChild
        tr_clone   = first_tr.cloneNode(true);

    table_body.append(tr_clone);

    clean_first_tr(table_body.firstElementChild);
}

function clean_first_tr(firstTr) {
    let children = firstTr.children;
    
    children = Array.isArray(children) ? children : Object.values(children);
    children.forEach(x=>{
        if(x !== firstTr.lastElementChild)
        {
            x.firstElementChild.value = '';
        }
    });
}



function remove_tr(This) {
    if(This.closest('tbody').childElementCount == 1)
    {
        alert("You Don't have Permission to Delete This ?");
    }else{
        This.closest('tr').remove();
    }
}

function create_tr2(table_id) {
    let table_body2 = document.getElementById(table_id),
        first_tr2   = table_body.firstElementChild
        tr_clone2   = first_tr2.cloneNode(true);

    table_body2.append(tr_clone2);

    clean_first_tr(table_body2.firstElementChild);
}

function clean_first_tr2(firstTr2) {
    let children2 = firstTr2.children;
    
    children2 = Array.isArray(children2) ? children2 : Object.values(children2);
    children2.forEach(x=>{
        if(x !== firstTr2.lastElementChild)
        {
            x.firstElementChild.value = '';
        }
    });
}



function remove_tr2(This) {
    if(This.closest('tbody2').childElementCount == 1)
    {
        alert("You Don't have Permission to Delete This ?");
    }else{
        This.closest('tr').remove();
    }
}
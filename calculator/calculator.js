sust_ops = [
    'neg',
    'clear',
    'add',
    'sub',
    'mul',
    'div',
    'mod',
]
desToDisOp = {
    'add':'+',
    'sub':'-',
    'mul':'*',
    'div':'÷',
    'mod':'%',
}
var last_ans = ''

resetPushedDown = function() {
    // console.log('reset pushed down')
    for(let i = 0; i < sust_ops.length; i++) {
        // console.log(sust_ops[i] + " reset")
        document.getElementById(sust_ops[i]).setAttribute("class", "btn")
    }
}

remap = function(sign) {
    if (sign == "÷")
        sign = "/"
    return sign
}

pushCurrentAns = function() {
    console.log(last_ans)
    last_ans = document.getElementById('ans').innerHTML
    console.log('last_ans ='+ last_ans)
    document.getElementById('ans').innerHTML = ''
}

calculateAndPush = function() {
    console.log('calculate and push')
    console.log(last_ans)
    ans = document.getElementById('ans').innerHTML
    sign = document.getElementById('op').innerHTML
    sign = remap(sign)
    console.log(last_ans.toString() + sign + ans)
    try {
        ans = eval(last_ans.toString() + sign + ans)
    } catch(e) {
        console.log(e)
        ans = 'Error'
        document.getElementById('ans').innerHTML = ans
        return
    }
    document.getElementById('ans').innerHTML = ''
    document.getElementById('op').innerHTML = ''
    console.log('ans ='+ ans)
    last_ans = ans
    calculateCompleted = true
}


calculateCompleted = false
delAns = function() {
    console.log('del ans')
    currentAns = document.getElementById('ans').innerHTML
    k = Math.abs(currentAns)
    k = k.toString()
    console.log(k)
    k = k.slice(0, -1)
    if (k == '') {
        k = 0
    }
    if (currentAns < 0) {
        k = -k
    }
    k = eval(k)
    k = k.toString()
    document.getElementById('ans').innerHTML = k
}

handleOp = function(describeOp) {
    displayOp = desToDisOp[describeOp]
    resetPushedDown()
    if(document.getElementById('op').innerHTML!= '' && document.getElementById('ans').innerHTML != '') {
        console.log('case1')
        calculateAndPush()
        document.getElementById(describeOp).setAttribute("class", "pushed-down")
        document.getElementById('op').innerHTML = displayOp
        return
    }
    if(document.getElementById('ans').innerHTML != '' && document.getElementById('op').innerHTML == '') {
        console.log('case3')
        pushCurrentAns()
        document.getElementById(describeOp).setAttribute("class", "pushed-down")
        document.getElementById('op').innerHTML = displayOp
        return
    }

    if(document.getElementById('ans').innerHTML == '' && document.getElementById('op').innerHTML == '' 
    && last_ans != '') {
        console.log('case4')
        document.getElementById(describeOp).setAttribute("class", "pushed-down")
        document.getElementById('op').innerHTML = displayOp
        return
    }
}
clickButton = function(msg) {
    if(document.getElementById('op').innerHTML != '') {
        document.getElementById('clear').innerHTML = 'C'
    }
    console.log("last_ans = " + last_ans)
    console.log(msg)
    var ans = document.getElementById('ans');
    if((msg >= '0' && msg <= '9') || msg == '.') {
        if(calculateCompleted) {
            document.getElementById('ans').innerHTML = ''
            calculateCompleted = false
            // if(document.getElementById('op').innerHTML == ''){
            //     console.log('set last ans to 0')
            //     last_ans = ''
            // }
                
        }
        if(ans.innerHTML == 'Error' || ans.innerHTML == 'Infinity' || ans.innerHTML == '-Infinity' || 
            ans.innerHTML == 'NaN' || ans.innerHTML == '0') {
                ans.innerHTML = '';
        }
        if((ans.innerHTML.indexOf('.') != -1) && msg == '.') {
            return;
        }
        if(ans.innerHTML == '' && msg == '.') {
            ans.innerHTML = ans.innerHTML + 0
        }
        if(ans.innerHTML.length < 15)
            ans.innerHTML = ans.innerHTML + msg;
        else
            console.log('Max length reached');
    }

    switch(msg) {
        case 'clear':
            if(document.getElementById('clear').innerHTML != 'AC'){
                console.log('clear button pushed down')
                ans.innerHTML = '';
                resetPushedDown()
                document.getElementById('op').innerHTML = '';
                if(last_ans == '' || last_ans == 0) {
                    return
                }
                document.getElementById('clear').innerHTML = 'AC';
            } else {
                console.log('AC button pushed down')
                resetPushedDown()
                document.getElementById('op').innerHTML = '';
                last_ans = 0;
                ans.innerHTML = '';
                document.getElementById('clear').innerHTML = 'C';
            }
            break;
        case 'neg':
            if (ans.innerHTML == '') {
                return
            }
            var x = eval(ans.innerHTML)
            x = -x
            var y = x.toString()
            ans.innerHTML = y;
            break;


        case 'mod':
            handleOp('mod')
            break;
        case 'div':
            handleOp('div')
            break;
        case 'mul':
            handleOp('mul')
            break;

        case 'sub':
            handleOp('sub')
            break;

        case 'add':
            handleOp('add')
            break;
        // case 'dot':
        //     break;
        case 'cal':
            resetPushedDown()
            console.log('cal button pushed down')
            console.log('things to calculate',document.getElementById('op').innerHTML, document.getElementById('ans').innerHTML)
            if(document.getElementById('op').innerHTML != '' && document.getElementById('ans').innerHTML != '') {
                calculateAndPush()
                document.getElementById('ans').innerHTML = last_ans
            }
            break;
    }
}
desToDisOp = {
    'add':'+',
    'sub':'-',
    'mul':'*',
    'div':'÷',
    'mod':'%',
}

testList = []
document.addEventListener('keydown', function(event) {
    // console.log(typeof(event.key))
    // testList.push(event.key)
    // console.log(testList)
    knownKeys = {
        '+':"add",
        '-':'sub',
        '*': 'mul',
        '%': 'mod',
        '/': 'div',
        'c': 'clear',
        'C': 'clear',
        '=': 'cal',
        "Enter" : 'cal',
        "Backspace": 'bs'

    }
    console.log(event.key)
    // console.log(knownKeys[event.key])
    // knownOps = ["+", "-", "*", "%", "c", "C", "/"]
    figures = new Set(['0', '1','2','3','4','5','6','7','8','9', '.'])
    if(figures.has(event.key)) {
        console.log('KeyBoard figure' + event.key + 'is pressed down')
        clickButton(event.key)
    } else if (knownKeys[event.key] != undefined) {
        if(event.key == 'Backspace') {
            delAns()
            return
        }
        console.log('KeyBoard opreation' + knownKeys[event.key] + 'is pressed down')
        clickButton(knownKeys[event.key]);
    }
    // clickButton();
});
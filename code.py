@ChatGPT#3799 i made a programming language in python
 can you write documentation for it
```python

import sys, os
import turtle as t

if len(sys.argv) > 1:
    dyr, fn = os.path.split(sys.argv[1])
    os.chdir(dyr)
    with open(fn, "r") as f:
        script = f.read()
        scexp = script.split("\n")



varname = []
varvalu = []
vartype = []


def end():
    t.bye()



window = t.Screen()
tutle = t.Turtle()
tutle.shape('turtle')
tutle.color('green')

i = 0
imax = len(scexp) - 1

while i <= imax:
    inpt = scexp[i]
    gon = inpt.split(" ")
    if(gon[0] == "right" or gon[0] == "rt"):
        if(gon[1][0] != "$"):
            tutle.right(int(gon[1]))
        if(gon[1][0] == "$"):
            tutle.right(varvalu[varname.index(gon[1])])
    if(gon[0] == "left" or gon[0] == "lt"):
        if(gon[1][0] != "$"):
            tutle.left(int(gon[1]))
        if(gon[1][0] == "$"):
            tutle.left(varvalu[varname.index(gon[1])])
    if(gon[0] == "forward" or gon[0] == "fd"):
        if(gon[1][0] != "$"):
            tutle.forward(int(gon[1]))
        if(gon[1][0] == "$"):
            tutle.forward(varvalu[varname.index(gon[1])])
    if(gon[0] == "text" or gon[0] == "tx"):
        tutle.write(gon[1],move=True,font=(gon[2],
                                    int(gon[3]), gon[4]))
    if(gon[0] == "var"):
        varname += ["$"+gon[2]]
        if(gon[1] == "int"):
            varvalu += [int(gon[3])]
            vartype += ["int"]
        if(gon[1] == "string"):
            varvalu += [gon[3]]
            vartype += ["string"]
        if(gon[1] == "bool"):
            if(gon[3] == "False"):
                varvalu += [False]
                vartype += ["bool"]
            elif(gon[3] == "True"):
                varvalu += [True]
                vartype += ["bool"]
            else:
                varvalu += [False]
                vartype += ["bool"]
    if(gon[0] == "set"):
        varnum = varname.index("$"+gon[1])
        
        if(gon[1][0] != "$"):
            if(vartype[varnum] == "int"):
                varvalu[varnum] = int(gon[2])
            if(vartype[varnum] == "string"):
                varvalu[varnum] = gon[2]
            if(vartype[varnum] == "bool"):
                varvalu[varnum] = bool(gon[2])
        if(gon[1][0] == "$" and vartype[varnum1] == vartype[varnum2]):
            varvalu[varnum1] = varvalu[varnum2]

    if(gon[0] == "add"):
        varnum1 = -1
        varnum2 = -1
        varnum3 = -1
        if gon[1] in varname: varnum1 = varname.index(gon[1])
        if gon[2] in varname: varnum2 = varname.index(gon[2])
        if gon[3] in varname: varnum2 = varname.index(gon[3])
        if(varnum3 != -1):
            if(varnum1 == -1 and varnum2 != -1):
                varvalu[varnum3] = int(gon[3]) + varvalu[varnum2]
            elif(varnum1 != -1 and varnum2 == -1):
                varvalu[varnum3] = varvalu[varnum1] + int(gon[2])
            elif(varnum1 != -1 and varnum2 != -1):
                varvalu[varnum3] = varvalu[varnum1] + varvalu[varnum2]
            elif(varnum1 == -1 and varnum2 == -1):
                varvalu[varnum3] = int(gon[2]) + int(gon[2])
        
    if(gon[0] == "print"):
        if(gon[1][0] != "$" and gon[1][0] != "@"):
            print(gon[1])
        if(gon[1][0] == "$"):
            print(varvalu[varname.index(gon[1])])
        if(gon[1][0] == "@"):
            print(pv[gon[1]])
    if(gon[0] == "cmp"):
        if(gon[3][0] == "$"):
            varnum1 = varname.index(gon[3])
            
        
        varvalu[varnum1] = gon[1] == gon[2]
        
        if(gon[2][0] == "$" and gon[1][0] == "$"):
            varvalu[varnum1] = int(varvalu[varname.index(gon[1])]) == int(varvalu[varname.index(gon[2])])
        if(gon[2][0] != "$" and gon[1][0] == "$"):
            varvalu[varnum1] = int(varvalu[varname.index(gon[1])]) == int(gon[2])
        if(gon[1][0] != "$" and gon[2][0] == "$"):
            varvalu[varnum1] = int(varvalu[varname.index(gon[2])]) == int(gon[1])
        if(gon[1][0] != "$" and gon[2][0] != "$"):
            varvalu[varnum1] = int(gon[2]) == int(gon[1])

    if(gon[0] == "jmp"):
        i = int(gon[1]) - 1
        if(gon[1][0] != "$"):
            i = int(gon[1]) - 1
        if(gon[1][0] == "$"):
            i = varvalu[varname.index(gon[1])] - 1
    if(gon[0] == "jnz"):
        if(not bool(varvalu[varname.index(gon[2])])):
            i = int(gon[1]) - 1
            if(gon[1][0] != "$"):
                i = int(gon[1]) - 1
            if(gon[1][0] == "$"):
                i = varvalu[varname.index(gon[1])] - 1
    if(gon[0] == "not"):
        varvalu[varname.index(gon[1])] = not varvalu[varname.index(gon[1])]
    if(gon[0] == "python"):
        code = ""
        for i in range(1,len(gon)):
            code += gon[i]
            code += " "
        exec(code,{"varvalu":varvalu,"varname":varname,"vartype":vartype,"gon":gon}, {'a' : 0, 'b' : 0})
    if(gon[0] == "input"):
        varnum1 = -1
        varnum2 = -1
        if gon[1] in varname: varnum1 = varname.index(gon[1])
        if gon[2] in varname: varnum2 = varname.index(gon[2])
        if(gon[3] == "int"):
            if(varnum1 == -1 and varnum2 != -1):
                print(int(input(varvalu[varnum2])))
            elif(varnum1 != -1 and varnum2 != -1):
                print(int(input(gon[2])))
            elif(varnum1 != -1 and varnum2 == -1):
                varvalu[varnum1] = int(input(gon[2]))
            elif(varnum1 != -1 and varnum2 != -1):
                varvalu[varnum1] = int(input(varvalu[varnum2]))
        if(gon[3] == "string"):
            if(varnum1 == -1 and varnum2 != -1):
                print(str(input(varvalu[varnum2])))
            elif(varnum1 != -1 and varnum2 != -1):
                print(str(input(gon[2])))
            elif(varnum1 != -1 and varnum2 == -1):
                varvalu[varnum1] = str(input(gon[2]))
            elif(varnum1 != -1 and varnum2 != -1):
                varvalu[varnum1] = str(input(varvalu[varnum2]))
        if(gon[3] == "bool"):
            if(varnum1 == -1 and varnum2 != -1):
                print(bool(input(varvalu[varnum2])))
            elif(varnum1 != -1 and varnum2 != -1):
                print(bool(input(gon[2])))
            elif(varnum1 != -1 and varnum2 == -1):
                varvalu[varnum1] = bool(input(gon[2]))
            elif(varnum1 != -1 and varnum2 != -1):
                varvalu[varnum1] = bool(input(varvalu[varnum2]))

    if(gon[0] == "sub"):
        varnum1 = -1
        varnum2 = -1
        varnum3 = -1
        if gon[1] in varname: varnum1 = varname.index(gon[1])
        if gon[2] in varname: varnum2 = varname.index(gon[2])
        if gon[3] in varname: varnum2 = varname.index(gon[3])
        if(varnum3 != -1):
            if(varnum1 == -1 and varnum2 != -1):
                varvalu[varnum3] = int(gon[3]) - varvalu[varnum2]
            elif(varnum1 != -1 and varnum2 == -1):
                varvalu[varnum3] = varvalu[varnum1] - int(gon[2])
            elif(varnum1 != -1 and varnum2 != -1):
                varvalu[varnum3] = varvalu[varnum1] - varvalu[varnum2]
            elif(varnum1 == -1 and varnum2 == -1):
                varvalu[varnum3] = int(gon[2]) - int(gon[2])

        
    if(gon[0] == "mul"):
        varnum1 = -1
        varnum2 = -1
        varnum3 = -1
        if gon[1] in varname: varnum1 = varname.index(gon[1])
        if gon[2] in varname: varnum2 = varname.index(gon[2])
        if gon[3] in varname: varnum2 = varname.index(gon[3])
        if(varnum3 != -1):
            if(varnum1 == -1 and varnum2 != -1):
                varvalu[varnum3] = int(gon[3]) * varvalu[varnum2]
            elif(varnum1 != -1 and varnum2 == -1):
                varvalu[varnum3] = varvalu[varnum1] * int(gon[2])
            elif(varnum1 != -1 and varnum2 != -1):
                varvalu[varnum3] = varvalu[varnum1] * varvalu[varnum2]
            elif(varnum1 == -1 and varnum2 == -1):
                varvalu[varnum3] = int(gon[2]) * int(gon[2])

        
    if(gon[0] == "div"):
        varnum1 = -1
        varnum2 = -1
        varnum3 = -1
        if gon[1] in varname: varnum1 = varname.index(gon[1])
        if gon[2] in varname: varnum2 = varname.index(gon[2])
        if gon[3] in varname: varnum2 = varname.index(gon[3])
        if(varnum3 != -1):
            if(varnum1 == -1 and varnum2 != -1):
                varvalu[varnum3] = int(gon[3]) // varvalu[varnum2]
            elif(varnum1 != -1 and varnum2 == -1):
                varvalu[varnum3] = varvalu[varnum1] // int(gon[2])
            elif(varnum1 != -1 and varnum2 != -1):
                varvalu[varnum3] = varvalu[varnum1] // varvalu[varnum2]
            elif(varnum1 == -1 and varnum2 == -1):
                varvalu[varnum3] = int(gon[2]) // int(gon[2])
        
    if(gon[0] == "mod"):
        varnum1 = -1
        varnum2 = -1
        varnum3 = -1
        if gon[1] in varname: varnum1 = varname.index(gon[1])
        if gon[2] in varname: varnum2 = varname.index(gon[2])
        if gon[3] in varname: varnum2 = varname.index(gon[3])
        if(varnum3 != -1):
            if(varnum1 == -1 and varnum2 != -1):
                varvalu[varnum3] = int(gon[3]) % varvalu[varnum2]
            elif(varnum1 != -1 and varnum2 == -1):
                varvalu[varnum3] = varvalu[varnum1] % int(gon[2])
            elif(varnum1 != -1 and varnum2 != -1):
                varvalu[varnum3] = varvalu[varnum1] % varvalu[varnum2]
            elif(varnum1 == -1 and varnum2 == -1):
                varvalu[varnum3] = int(gon[2]) % int(gon[2])
        
    i += 1
window.onkeypress(end, 'space')
window.listen()

t.done()
```

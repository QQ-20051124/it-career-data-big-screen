f = open('ai-career-login.html', 'w', encoding='utf-8')
for i in range(1, 19):
    f.write(open('h' + str(i) + '.txt', 'r', encoding='utf-8').read())
f.close()

Это мой проект на 2 тур nFactorial Incubator. Проект про создание игры клона монополии. Проект имеет многие схожести с оригинальной игрой, та же логика, те же правила, и даже визуалы. Игра предназначена для игры для нескольких игроков. Есть функционал покупки и аренды имуществ, тот кто останется последним не обанкроченным побеждает.

Инструкция:
bash: cd server 
node index.js
cd client
npm start

после этого появится экран с привествием и способы подключения 
подключается элементарно
чтобы проверить работоспособность можно использовать две вкладки
сначала был создан макет и дизайн для монополии и в дальнейшем были использованы
Уникальными можно наверно назвать сам факт того что есть динамичная доска для монополии который меняет цвет еще хочу отметить способ передачи очередей и их передвижения и отображения на доске

самой главной дилеммой было либо использвовать boardgame.io или websocket решил в итоге исопльзовать второй вариант ведь с первым вариантом при работе были очень много проблем, и много информации просто не переходило друг другу и в целом дизайн и логика не сопостовлялась
в итоге решил использовать React + socket.io

ошибки разумеются имеются - например меня сильно раздражает то когда даже если много раз пробовал решить но все равно появляется кнопка купить клеткуу даже если она куплена или не покупается, еще есть ошибки с связыванием. 
Недавно заметил очень большой баг, до часа до дедлайна у меня все игроки кроме первого просто перестали двигатсяб я не знаю с чем это связано перепробовал очень много вариантов - не помогло, решил сдать и без него, но уверяю, что оно работало до этого даже если не идеально. 

Выбрал react из за того что с ним легко работать особенно для веб приложении, новый и свежий дизайн. 

Выбрал socket.io так как он был намного понятнее и легче чем gameboard.io
и для меня был идеальным вариантом обучаться + не использовать билт ин функции а делать логики все самому

с серверной частью тоже проблемы, не особо разбираюсь в деплойменте и в серверах

спасибо за просмотр!

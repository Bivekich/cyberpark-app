import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function TermsOfServiceScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Условия использования',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
          ),
        }}
      />
      <StatusBar style="dark" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.heading}>Условия использования</Text>
          <Text style={styles.date}>Последнее обновление: 20 марта 2023</Text>

          <Text style={styles.sectionHeading}>1. Введение</Text>
          <Text style={styles.paragraph}>
            Настоящие Условия использования ("Условия") регулируют ваш доступ и
            использование мобильного приложения CyberPark, включая любой
            контент, функциональность и услуги, предлагаемые на или через
            приложение ("Сервис"), принадлежащее и управляемое компанией
            CyberPark.
          </Text>
          <Text style={styles.paragraph}>
            Пожалуйста, внимательно прочитайте Условия перед началом
            использования нашего Сервиса. Используя Сервис, вы принимаете и
            соглашаетесь соблюдать эти Условия. Если вы не согласны с этими
            Условиями, вы не должны получать доступ или использовать Сервис.
          </Text>

          <Text style={styles.sectionHeading}>2. Право на использование</Text>
          <Text style={styles.paragraph}>
            CyberPark предоставляет вам ограниченное, неисключительное, не
            подлежащее передаче право на доступ и использование Сервиса
            исключительно для вашего личного, некоммерческого использования. Это
            право предоставляется при условии, что вы соблюдаете эти Условия.
          </Text>

          <Text style={styles.sectionHeading}>
            3. Учетная запись пользователя
          </Text>
          <Text style={styles.paragraph}>
            Чтобы использовать определенные функции нашего Сервиса, вам может
            потребоваться зарегистрировать учетную запись. Вы соглашаетесь с
            тем, что:
          </Text>
          <Text style={styles.bulletPoint}>
            • Предоставляемая вами информация при регистрации учетной записи
            является точной и актуальной
          </Text>
          <Text style={styles.bulletPoint}>
            • Вы несете ответственность за сохранение конфиденциальности вашего
            пароля
          </Text>
          <Text style={styles.bulletPoint}>
            • Вы несете ответственность за любые действия, совершенные под вашей
            учетной записью
          </Text>
          <Text style={styles.bulletPoint}>
            • Вы немедленно уведомите нас о любом несанкционированном
            использовании вашей учетной записи
          </Text>

          <Text style={styles.sectionHeading}>
            4. Правила использования сервиса
          </Text>
          <Text style={styles.paragraph}>
            При использовании Сервиса вы соглашаетесь не:
          </Text>
          <Text style={styles.bulletPoint}>
            • Нарушать какие-либо применимые законы или правила
          </Text>
          <Text style={styles.bulletPoint}>
            • Выдавать себя за другое лицо или организацию
          </Text>
          <Text style={styles.bulletPoint}>
            • Вмешиваться в работу Сервиса или серверов и сетей, связанных с
            Сервисом
          </Text>
          <Text style={styles.bulletPoint}>
            • Использовать Сервис для каких-либо незаконных или
            несанкционированных целей
          </Text>
          <Text style={styles.bulletPoint}>
            • Пытаться обойти меры безопасности нашего Сервиса
          </Text>
          <Text style={styles.bulletPoint}>
            • Собирать данные о других пользователях без их согласия
          </Text>

          <Text style={styles.sectionHeading}>
            5. Аренда транспортных средств
          </Text>
          <Text style={styles.paragraph}>
            Используя наш Сервис для аренды электромобилей, вы соглашаетесь:
          </Text>
          <Text style={styles.bulletPoint}>
            • Иметь действующие водительские права и быть старше 18 лет
          </Text>
          <Text style={styles.bulletPoint}>
            • Соблюдать все правила дорожного движения и парковки
          </Text>
          <Text style={styles.bulletPoint}>
            • Использовать автомобиль только в разрешенных зонах, указанных в
            приложении
          </Text>
          <Text style={styles.bulletPoint}>
            • Нести ответственность за любой ущерб, причиненный автомобилю по
            вашей вине
          </Text>
          <Text style={styles.bulletPoint}>
            • Не водить в состоянии алкогольного или наркотического опьянения
          </Text>
          <Text style={styles.bulletPoint}>
            • Не участвовать в гонках, соревнованиях или грубом вождении
          </Text>
          <Text style={styles.bulletPoint}>
            • Немедленно сообщать о любых происшествиях или повреждениях
            автомобиля
          </Text>

          <Text style={styles.sectionHeading}>6. Платежи и тарифы</Text>
          <Text style={styles.paragraph}>
            Используя наш Сервис, вы соглашаетесь оплачивать все сборы и налоги,
            применимые к вашему использованию. Оплата будет взиматься с вашего
            выбранного способа оплаты. Все платежи являются невозвратными, за
            исключением случаев, предусмотренных законом или на исключительное
            усмотрение CyberPark.
          </Text>
          <Text style={styles.paragraph}>
            Тарифы на аренду транспортных средств указаны в приложении и могут
            варьироваться в зависимости от времени суток, местоположения и
            спроса. Мы оставляем за собой право изменять наши тарифы в любое
            время.
          </Text>

          <Text style={styles.sectionHeading}>7. Изменения в Сервисе</Text>
          <Text style={styles.paragraph}>
            Мы оставляем за собой право по своему усмотрению изменять, добавлять
            или удалять части этих Условий в любое время. Вы должны периодически
            проверять эти Условия на предмет изменений. Продолжая использовать
            Сервис после публикации изменений в Условиях, вы соглашаетесь с
            измененными Условиями.
          </Text>

          <Text style={styles.sectionHeading}>
            8. Ограничение ответственности
          </Text>
          <Text style={styles.paragraph}>
            В максимальной степени, разрешенной законом, CyberPark не несет
            ответственности за любые прямые, косвенные, случайные, особые,
            последующие или штрафные убытки, включая, но не ограничиваясь,
            потерю прибыли, данных, использования, репутации или другие
            нематериальные потери, возникающие в результате:
          </Text>
          <Text style={styles.bulletPoint}>
            • Вашего доступа к Сервису или использования его или невозможности
            доступа или использования
          </Text>
          <Text style={styles.bulletPoint}>
            • Любого поведения или контента третьих лиц в Сервисе
          </Text>
          <Text style={styles.bulletPoint}>
            • Любого контента, полученного из Сервиса
          </Text>
          <Text style={styles.bulletPoint}>
            • Несанкционированного доступа, использования или изменения ваших
            передач или контента
          </Text>

          <Text style={styles.sectionHeading}>9. Прекращение</Text>
          <Text style={styles.paragraph}>
            Мы можем прекратить или приостановить ваш доступ к Сервису
            немедленно, без предварительного уведомления или ответственности, по
            любой причине, включая, без ограничений, нарушение вами этих
            Условий.
          </Text>
          <Text style={styles.paragraph}>
            После прекращения ваше право на использование Сервиса немедленно
            прекращается. Если вы хотите прекратить свою учетную запись, вы
            можете просто прекратить использование Сервиса.
          </Text>

          <Text style={styles.sectionHeading}>10. Применимое право</Text>
          <Text style={styles.paragraph}>
            Эти Условия регулируются и толкуются в соответствии с законами
            Российской Федерации, без учета принципов коллизионного права.
          </Text>
          <Text style={styles.paragraph}>
            Наша неспособность обеспечить соблюдение какого-либо права или
            положения этих Условий не будет считаться отказом от этих прав.
          </Text>

          <Text style={styles.sectionHeading}>11. Контактная информация</Text>
          <Text style={styles.paragraph}>
            Если у вас есть какие-либо вопросы или предложения относительно
            наших Условий, пожалуйста, свяжитесь с нами:
          </Text>
          <Text style={styles.bulletPoint}>
            • По электронной почте: legal@cyberpark.ru
          </Text>
          <Text style={styles.bulletPoint}>
            • По телефону: +7 (800) 123-45-67
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    marginLeft: 16,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000000',
  },
  date: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 24,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
    color: '#000000',
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333333',
    marginBottom: 16,
  },
  bulletPoint: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333333',
    marginBottom: 8,
    marginLeft: 16,
  },
});

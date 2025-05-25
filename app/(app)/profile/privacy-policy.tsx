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

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Политика конфиденциальности',
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
          <Text style={styles.heading}>Политика конфиденциальности</Text>
          <Text style={styles.date}>Последнее обновление: 20 марта 2023</Text>

          <Text style={styles.sectionHeading}>1. Введение</Text>
          <Text style={styles.paragraph}>
            Настоящая Политика конфиденциальности описывает, как CyberPark
            ("мы", "нас" или "наш") собирает, использует и раскрывает вашу
            информацию при использовании нашего мобильного приложения CyberPark
            (далее - "Сервис").
          </Text>
          <Text style={styles.paragraph}>
            Мы используем ваши данные для предоставления и улучшения Сервиса.
            Используя Сервис, вы соглашаетесь на сбор и использование информации
            в соответствии с этой политикой.
          </Text>

          <Text style={styles.sectionHeading}>
            2. Сбор и использование информации
          </Text>
          <Text style={styles.paragraph}>
            Для улучшения вашего опыта при использовании нашего Сервиса, мы
            можем запросить предоставление определенной личной информации,
            включая, но не ограничиваясь:
          </Text>
          <Text style={styles.bulletPoint}>
            • Контактная информация (имя, электронная почта, номер телефона)
          </Text>
          <Text style={styles.bulletPoint}>• Информация о местоположении</Text>
          <Text style={styles.bulletPoint}>• Информация об устройстве</Text>
          <Text style={styles.bulletPoint}>• Данные транзакций</Text>

          <Text style={styles.sectionHeading}>3. Данные журнала</Text>
          <Text style={styles.paragraph}>
            Мы также собираем информацию, которую ваш браузер отправляет при
            посещении нашего Сервиса или при доступе к Сервису через мобильное
            устройство ("Данные журнала").
          </Text>

          <Text style={styles.sectionHeading}>4. Использование данных</Text>
          <Text style={styles.paragraph}>
            CyberPark использует собранные данные для различных целей:
          </Text>
          <Text style={styles.bulletPoint}>
            • Предоставление и поддержка нашего Сервиса
          </Text>
          <Text style={styles.bulletPoint}>
            • Уведомление об изменениях в нашем Сервисе
          </Text>
          <Text style={styles.bulletPoint}>
            • Предоставление поддержки клиентов
          </Text>
          <Text style={styles.bulletPoint}>
            • Анализ и улучшение нашего Сервиса
          </Text>
          <Text style={styles.bulletPoint}>
            • Мониторинг использования Сервиса
          </Text>
          <Text style={styles.bulletPoint}>
            • Обнаружение, предотвращение и решение технических проблем
          </Text>

          <Text style={styles.sectionHeading}>5. Передача данных</Text>
          <Text style={styles.paragraph}>
            Ваша информация, включая Персональные данные, может быть передана и
            храниться на компьютерах, расположенных за пределами вашего региона,
            провинции, страны или другой правительственной юрисдикции, где
            законы о защите данных могут отличаться от законов вашей юрисдикции.
          </Text>

          <Text style={styles.sectionHeading}>6. Раскрытие данных</Text>
          <Text style={styles.paragraph}>
            CyberPark может раскрывать ваши Персональные данные добросовестно
            полагая, что такие действия необходимы для:
          </Text>
          <Text style={styles.bulletPoint}>
            • Выполнения юридических обязательств
          </Text>
          <Text style={styles.bulletPoint}>
            • Защиты и защиты прав или собственности CyberPark
          </Text>
          <Text style={styles.bulletPoint}>
            • Предотвращения или расследования возможных правонарушений в связи
            с Сервисом
          </Text>
          <Text style={styles.bulletPoint}>
            • Защиты личной безопасности пользователей Сервиса или
            общественности
          </Text>
          <Text style={styles.bulletPoint}>
            • Защиты от юридической ответственности
          </Text>

          <Text style={styles.sectionHeading}>7. Безопасность данных</Text>
          <Text style={styles.paragraph}>
            Безопасность ваших данных важна для нас, но помните, что ни один
            метод передачи через Интернет или метод электронного хранения не
            является на 100% безопасным. Хотя мы стремимся использовать
            коммерчески приемлемые средства для защиты ваших Персональных
            данных, мы не можем гарантировать их абсолютную безопасность.
          </Text>

          <Text style={styles.sectionHeading}>
            8. Ваши права на защиту данных
          </Text>
          <Text style={styles.paragraph}>
            Вы имеете определенные права на защиту данных. CyberPark стремится
            предпринять разумные шаги для того, чтобы вы могли исправлять,
            изменять, удалять или ограничивать использование ваших Персональных
            данных.
          </Text>

          <Text style={styles.sectionHeading}>
            9. Изменения в политике конфиденциальности
          </Text>
          <Text style={styles.paragraph}>
            Мы можем обновлять нашу Политику конфиденциальности время от
            времени. Мы уведомим вас о любых изменениях, разместив новую
            Политику конфиденциальности на этой странице.
          </Text>
          <Text style={styles.paragraph}>
            Мы сообщим вам по электронной почте и/или заметному уведомлению в
            нашем Сервисе, прежде чем изменения вступят в силу, и обновим "дату
            последнего обновления" в верхней части этой Политики
            конфиденциальности.
          </Text>
          <Text style={styles.paragraph}>
            Вам рекомендуется периодически просматривать эту Политику
            конфиденциальности на предмет любых изменений. Изменения в этой
            Политике конфиденциальности вступают в силу, когда они размещаются
            на этой странице.
          </Text>

          <Text style={styles.sectionHeading}>10. Контактная информация</Text>
          <Text style={styles.paragraph}>
            Если у вас есть какие-либо вопросы об этой Политике
            конфиденциальности, пожалуйста, свяжитесь с нами:
          </Text>
          <Text style={styles.bulletPoint}>
            • По электронной почте: privacy@cyberpark.ru
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

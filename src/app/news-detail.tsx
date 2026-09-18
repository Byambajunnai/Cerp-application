import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function NewsDetailScreen() {
  const { userNm, cstmNm, userId, newsId } =
    useLocalSearchParams<{
      userNm?: string;
      cstmNm?: string;
      userId?: string;
      newsId?: string;
    }>();

  return (
    <SafeAreaView style={styles.safeArea}>

      {/* ================= HEADER ================= */}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Feather
            name="chevron-left"
            size={28}
            color="#263247"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Мэдээллийн дэлгэрэнгүй
        </Text>
      </View>


      {/* ================= CONTENT ================= */}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        <View style={styles.detailCard}>

          {/* Гарчиг */}

          <Text style={styles.newsTitle}>
            Япон улсын Төрийн бодлого судлалын үндэсний хүрээлэн - 2027 оны Намрын элсэлт
          </Text>


          {/* Огноо + үүсгэсэн */}

          <View style={styles.metaRow}>

            <View style={styles.metaItem}>
              <Feather
                name="calendar"
                size={16}
                color="#596274"
              />

              <Text style={styles.metaText}>
                2026-09-17
              </Text>
            </View>


            <View style={styles.metaItem}>
              <Feather
                name="user"
                size={17}
                color="#596274"
              />

              <Text style={styles.metaText}>
                Э.ЭНХТУЯА
              </Text>
            </View>

          </View>


          {/* ================= МЭДЭЭНИЙ АГУУЛГА ================= */}

          <View style={styles.descriptionBox}>

            <Text style={styles.paragraph}>
              ЯПОН УЛСЫН ТОКИО ХОТНОО БАЙРЛАХ
            </Text>

            <Text style={styles.paragraph}>
              ТӨРИЙН БОДЛОГО СУДЛАЛЫН ҮНДЭСНИЙ
            </Text>

            <Text style={styles.paragraph}>
              ХҮРЭЭЛЭН (NATIONAL GRADUATE INSTITUTE
            </Text>

            <Text style={styles.paragraph}>
              FOR POLICY STUDIES – GRIPS) 2027 НАМРЫН
            </Text>

            <Text style={styles.paragraph}>
              УЛИРАЛД МАГИСТР, ДОКТОРЫН ЧИГЛЭЛЭЭР
            </Text>

            <Text style={styles.paragraph}>
              ДАРААХ ЧИГЛЭЛЭЭР ЭЛСЭЛТЭЭ ЗАРЛАЖ БАЙНА.
            </Text>


            <Text style={styles.programTitle}>
              Хөтөлбөрүүд:
            </Text>


            <View style={styles.bulletRow}>
              <Text style={styles.bullet}>•</Text>

              <Text style={styles.bulletText}>
                Залуу манлайлагчдын хөтөлбөр – Төрийн удирдлагын сургууль
              </Text>
            </View>


            <View style={styles.bulletRow}>
              <Text style={styles.bullet}>•</Text>

              <Text style={styles.bulletText}>
                Макро эдийн засгийн бодлогын хөтөлбөр
              </Text>
            </View>


            <View style={styles.bulletRow}>
              <Text style={styles.bullet}>•</Text>

              <Text style={styles.bulletText}>
                Төрийн бодлогын магистрын хөтөлбөр – 1 жилийн хугацаатай
              </Text>
            </View>


            <View style={styles.bulletRow}>
              <Text style={styles.bullet}>•</Text>

              <Text style={styles.bulletText}>
                Төрийн бодлогын магистрын хөтөлбөр – 2 жилийн хугацаатай
              </Text>
            </View>

          </View>


          {/* ================= ATTACHMENT ================= */}

          <View style={styles.attachmentBox}>

            <View style={styles.attachmentTitleRow}>
              <Feather
                name="paperclip"
                size={20}
                color="#428CE5"
              />

              <Text style={styles.attachmentTitle}>
                Хавсралт файл (2)
              </Text>
            </View>


            {/* PDF 1 */}

            <TouchableOpacity
              style={styles.fileItem}
              activeOpacity={0.8}
            >

              <View style={styles.pdfIcon}>
                <Text style={styles.pdfText}>
                  PDF
                </Text>
              </View>

              <Text
                style={styles.fileName}
                numberOfLines={1}
              >
                Журам.pdf
              </Text>

              <View style={styles.downloadButton}>
                <Feather
                  name="arrow-down"
                  size={19}
                  color="#FFFFFF"
                />
              </View>

            </TouchableOpacity>


            {/* PDF 2 */}

            <TouchableOpacity
              style={styles.fileItem}
              activeOpacity={0.8}
            >

              <View style={styles.pdfIcon}>
                <Text style={styles.pdfText}>
                  PDF
                </Text>
              </View>

              <Text
                style={styles.fileName}
                numberOfLines={1}
              >
                Танилцуулга.pdf
              </Text>

              <View style={styles.downloadButton}>
                <Feather
                  name="arrow-down"
                  size={19}
                  color="#FFFFFF"
                />
              </View>

            </TouchableOpacity>

          </View>

        </View>

      </ScrollView>


      {/* ================= BOTTOM NAV ================= */}

      <View style={styles.bottomNav}>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() =>
            router.replace({
              pathname: '/home',
              params: {
                userNm,
                cstmNm,
                userId,
              },
            })
          }
        >
          <Feather
            name="grid"
            size={23}
            color="#94A3B8"
          />

          <Text style={styles.navText}>
            Нүүр
          </Text>
        </TouchableOpacity>


        <TouchableOpacity style={styles.navItem}>
          <Feather
            name="edit-3"
            size={22}
            color="#94A3B8"
          />

          <Text style={styles.navText}>
            Хүсэлт
          </Text>
        </TouchableOpacity>


        <TouchableOpacity
          style={styles.plusButton}
          activeOpacity={0.8}
        >
          <Feather
            name="plus"
            size={31}
            color="#FFFFFF"
          />
        </TouchableOpacity>


        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.back()}
        >
          <Feather
            name="book-open"
            size={22}
            color="#428CE5"
          />

          <Text style={styles.activeNavText}>
            Мэдээ
          </Text>
        </TouchableOpacity>


        <TouchableOpacity style={styles.navItem}>
          <Feather
            name="user"
            size={22}
            color="#94A3B8"
          />

          <Text style={styles.navText}>
            Миний
          </Text>
        </TouchableOpacity>

      </View>

    </SafeAreaView>
  );
}


const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFD',
  },


  /* HEADER */

  header: {
    height: 70,
    backgroundColor: '#F8FAFD',

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 16,
  },

  backButton: {
    width: 42,
    height: 42,

    borderRadius: 21,

    backgroundColor: '#FFFFFF',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 10,
  },

  headerTitle: {
    fontSize: 19,
    fontWeight: '500',
    color: '#20283A',
  },


  /* SCROLL */

  scroll: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 17,
    paddingBottom: 30,
  },


  /* DETAIL CARD */

  detailCard: {
    backgroundColor: '#FFFFFF',

    borderRadius: 12,

    paddingHorizontal: 15,
    paddingTop: 20,
    paddingBottom: 18,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },


  /* TITLE */

  newsTitle: {
    fontSize: 14,
    lineHeight: 28,

    fontWeight: '500',

    color: '#428CE5',

    marginBottom: 15,
  },


  /* META */

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    paddingHorizontal: 4,

    marginBottom: 18,
  },

  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  metaText: {
    fontSize: 11,
    color: '#303744',

    marginLeft: 10,
  },


  /* DESCRIPTION */

  descriptionBox: {
    borderWidth: 1,
    borderColor: '#DCE3EC',

    borderRadius: 10,

    paddingHorizontal: 10,
    paddingVertical: 12,

    marginBottom: 13,
  },

  paragraph: {
    fontSize: 10.5,
    lineHeight: 19,

    color: '#202020',

    marginBottom: 4,
  },

  programTitle: {
    fontSize: 10.5,
    fontWeight: '500',

    color: '#202020',

    marginTop: 6,
    marginBottom: 8,
  },

  bulletRow: {
    flexDirection: 'row',

    paddingRight: 8,

    marginBottom: 7,
  },

  bullet: {
    width: 18,

    fontSize: 12,

    color: '#202020',

    textAlign: 'center',
  },

  bulletText: {
    flex: 1,

    fontSize: 10.5,
    lineHeight: 19,

    color: '#202020',
  },


  /* ATTACHMENT */

  attachmentBox: {
    backgroundColor: '#EAF3FF',

    borderRadius: 10,

    padding: 12,
  },

  attachmentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',

    marginBottom: 12,
  },

  attachmentTitle: {
    fontSize: 13,
    fontWeight: '500',

    color: '#263247',

    marginLeft: 9,
  },


  /* FILE */

  fileItem: {
    height: 47,

    backgroundColor: '#FFFFFF',

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 12,

    marginBottom: 8,
  },

  pdfIcon: {
    width: 23,
    height: 27,

    backgroundColor: '#E94343',

    borderRadius: 3,

    alignItems: 'center',
    justifyContent: 'center',
  },

  pdfText: {
    fontSize: 7,
    fontWeight: '700',

    color: '#FFFFFF',
  },

  fileName: {
    flex: 1,

    marginLeft: 12,

    fontSize: 12,

    color: '#242424',
  },

  downloadButton: {
    width: 27,
    height: 27,

    borderRadius: 14,

    backgroundColor: '#428CE5',

    alignItems: 'center',
    justifyContent: 'center',
  },


  /* BOTTOM NAV */

  bottomNav: {
    height: 84,

    backgroundColor: '#FFFFFF',

    borderTopWidth: 1,
    borderTopColor: '#E4E7EC',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',

    paddingHorizontal: 7,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 5,

    elevation: 5,
  },

  navItem: {
    flex: 1,

    alignItems: 'center',
    justifyContent: 'center',
  },

  navText: {
    marginTop: 5,

    fontSize: 9,

    color: '#94A3B8',
  },

  activeNavText: {
    marginTop: 5,

    fontSize: 9,
    fontWeight: '600',

    color: '#428CE5',
  },

  plusButton: {
    width: 55,
    height: 55,

    borderRadius: 28,

    backgroundColor: '#428CE5',

    alignItems: 'center',
    justifyContent: 'center',

    marginHorizontal: 9,

    shadowColor: '#428CE5',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,

    elevation: 5,
  },
});
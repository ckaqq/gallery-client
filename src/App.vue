<template>
  <div class="app">
    <navbar :path="path" :description="description"></navbar>
    <div class="content">
      <div class="loading" v-if="isLoading">
        <div class="spinner">
          <div class="double-bounce1"></div>
          <div class="double-bounce2"></div>
        </div>
      </div>
      <div class="error message" v-else-if="error">
        <i class="fa fa-times-circle"></i>
        <span class="content" v-if="!gallery.questions.length">{{error}}</span>
        <span class="content" @click="askQuestion(gallery.questions)" v-else>{{error}}</span>
      </div>
      <div v-else>
        <gallery :gallery="gallery" :checkAnswer="checkAnswer"></gallery>
        <photo-swipe gallerySelector=".gallery" imageSelector=".image" titleSelector=".extra"></photo-swipe>
      </div>
    </div>
  </div>
</template>

<script>
import Navbar from '@/components/Navbar'
import Gallery from '@/components/Gallery'
import PhotoSwipe from '@/components/PhotoSwipe'
import answerUtil from '@/utils/answer'
import config from '@/utils/config'
import getUpyunClient from '@/utils/upyun'

export default {
  components: {
    Navbar,
    Gallery,
    PhotoSwipe
  },

  data () {
    return {
      error: null,
      gallery: null,
      upyunClient: null,
      loading: false
    }
  },

  async mounted () {
    const password = localStorage.getItem(config.passwordKey)
    if (password) {
      const result = await this.checkAnswer(password)
      if (result) {
        return this.getGallery()
      }
    }
    this.askQuestion()
  },

  computed: {
    path () {
      return this.$route.query.path || '/'
    },

    description () {
      return this.gallery ? this.gallery.description : null
    },

    isLoading () {
      return this.loading
    },

    title () {
      if (!this.gallery || this.gallery.name === '/') {
        return config.title
      } else {
        return this.gallery.name + ' - ' + config.title
      }
    }
  },

  methods: {
    checkAnswer (password) {
      const client = getUpyunClient(password)
      return client.usage('/').then(() => {
        this.upyunClient = client
        localStorage.setItem(config.passwordKey, password)
        return true
      }).catch(() => {
        localStorage.removeItem(config.passwordKey)
        return false
      })
    },

    askQuestion () {
      answerUtil(this.checkAnswer).then((result) => {
        if (!result.value) {
          this.error = '需要正确回答问题后才能访问！'
          return null
        }
        return this.getGallery()
      })
    },

    async getGallery () {
      this.loading = true
      this.error = null
      const path = this.$route.query.path || '/'
      this.gallery = await this.upyunClient.getAlbumAsync(path)
      if (!this.gallery.albums.length && !this.gallery.images.length) {
        this.error = '相册中还没有内容呢'
      }
      this.loading = false
    }
  },
  watch: {
    '$route' () {
      return this.getGallery()
    },
    title (title) {
      document.title = title
    }
  }
}
</script>

<style lang="less">
@import './assets/css/main.less';
@import '../node_modules/sweetalert2/dist/sweetalert2.min.css';
@import '../node_modules/photoswipe/dist/photoswipe.css';
@import '../node_modules/photoswipe/dist/default-skin/default-skin.css';
</style>

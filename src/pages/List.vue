<template>
  <div>
    <div class="tab-list">
      <div class="tab-item" :class="{ 'tab-item-active': index === active }" v-for="(item,index) in tab" :key="index" @click="handleTabClick(index)">{{ item }}</div>
    </div>
    <div class="wrapper">
      <swiper :options="swiperOption" ref="mySwiper">
        <swiper-slide v-for="(group,groupIndex) in list" :key="groupIndex">
          <div class="scroll-wrapper" :id="'list' + groupIndex">
            <ul class="scroll-content">
              <load-more v-if="isShowRefresh" :tip="'正在刷新'"></load-more>
              <li class="post-container" v-for="(item,index) in group" :key="index">
                <div class="post-author-date">
                  <img class="post-author" src="@/assets/images/avatar/1.png"/>
                  <span class="post-date">{{ item.date }}</span>
                </div>
                <span class="post-title">{{ item.title }}</span>
                <img class="post-img" src="@/assets/images/post/crab.png"/>
                <span class="post-content">{{ item.content }}</span>
                <div class="post-like">
                  <img class="post-like-img" src="@/assets/images/icon/chat.png"/>
                  <span class="post-like-font">{{ item.collection }}</span>
                  <img class="post-like-img" src="@/assets/images/icon/view.png"/>
                  <span class="post-like-font">{{ item.reading }}</span>
                </div>
              </li>
              <load-more v-if="isShowLoadMore" :tip="'正在加载'"></load-more>
            </ul>
          </div>
        </swiper-slide>
      </swiper>
    </div>
  </div>
</template>

<script>
import BScroll from 'better-scroll'
import { LoadMore } from 'vux'

export default {
  name: 'List',
  components: {
    LoadMore
  },
  data () {
    return {
      tab: [],
      list: [],
      swiperOption: {
        // 所有的参数同 swiper 官方 api 参数
        on: {
          slideChange: () => {
            this.active = this.swiper.activeIndex
          }
        }
      },
      active: 0,
      scroll: '',
      isShowRefresh: false,
      isShowLoadMore: true,
      refreshing: false,
      loading: false
    }
  },
  computed: {
    swiper () {
      return this.$refs.mySwiper.swiper
    },
    isPull () { // 刷新中和下拉加载中不能触发新的数据调用
      return !this.refreshing && !this.loading
    }
  },
  watch: {
    active () {
      this.$nextTick(() => {
        this.createScroll()
      })
    }
  },
  mounted () {
    this.getList()
  },
  methods: {
    getList () { // 获取初始数据
      this.$request({
        url: '/example/list',
        method: 'get'
      }).then(res => {
        if (res.code === 0) {
          this.tab = res.data.tab
          this.list = res.data.list
          this.$nextTick(() => {
            this.createScroll()
          })
        }
      })
    },
    handleTabClick (index) {
      this.active = index
      this.swiper.slideTo(this.active, 200, false)
    },
    pullDown () { // 下拉刷新当前栏目数据
      this.refreshing = true
      this.isShowRefresh = true
      this.$request({
        url: '/example/list',
        method: 'get'
      }).then(res => {
        if (res.code === 0) {
          const activeList = this.list[this.active]
          const activeLength = this.list[this.active].length
          const addList = res.data.list[this.active]
          activeList.splice(0, activeLength)
          addList.forEach(item => {
            activeList.push(item)
          })
          this.list[this.active] = activeList
          setTimeout(() => {
            this.isShowRefresh = false
          }, 1000)
          this.$nextTick(() => {
            this.scroll.refresh()
            this.$nextTick(() => {
              setTimeout(() => {
                this.refreshing = false
              }, 1000)
            })
          })
        }
      })
    },
    pullUp () { // 上拉获取数据
      this.loading = true
      this.$request({
        url: '/example/pullUp',
        method: 'get'
      }).then(res => {
        if (res.code === 0) {
          // console.log(res.data)
          const addList = res.data
          const activeList = this.list[this.active]
          addList.forEach(item => {
            activeList.push(item)
          })
          this.list[this.active] = activeList
          this.$nextTick(() => {
            this.scroll.refresh()
            this.$nextTick(() => {
              this.loading = false
            })
          })
        }
      })
    },
    createScroll () {
      if (this.scroll) {
        this.scroll.destroy()
      }
      const wrapper = document.querySelector('#list' + this.active)
      this.scroll = new BScroll(wrapper, {
        scrollY: true,
        click: true,
        probeType: 3
      })
      this.scroll.on('scroll', this.onScroll)
    },
    onScroll (pos) {
      if (pos.y > 50 && this.isPull) {
        this.pullDown()
      }
      if (pos.y < this.scroll.maxScrollY && this.isPull) {
        this.pullUp()
      }
    }
  }
}
</script>

<style scoped>
.tab-list{
  padding-top: .1rem;
  width: 100%;
  display: flex;
  overflow-x: auto;
}
.tab-list::-webkit-scrollbar {
   display: none;
}

.tab-item{
  flex-shrink: 0;
  width: 2rem;
  height: .7rem;
  line-height: .7rem;
  text-align: center;
  font-size: .24rem;
  color: #333333;
  white-space: nowrap;
}
.tab-item-active{
  color: #ff0000;
  border-bottom: .02rem solid #ff0000;
}

.wrapper{
  position: absolute;
  top: .85rem;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}
.wrapper >>> .swiper-container{
  height: 100%;
}
.wrapper >>> .swiper-wrapper{
  height: 100%;
}
.wrapper >>> .swiper-slide{
  height: 100%;
}
.scroll-wrapper{
  height: 100%;
}
.scroll-content{
  background-color: #E8E8E8;
  border-top: 1px solid transparent;
  border-bottom: 1px solid transparent;
}
.post-container{
  flex-direction: column;
  display: flex;
  margin-top: .2rem;
  margin-bottom: .4rem;
  margin-left: 0;
  background-color: #fff;
  border-bottom: .02rem solid #ededed;
  border-top: .02rem solid #ededed;
  padding-bottom: .1rem;
}

.post-author-date{
  margin-top: .1rem;
  margin-bottom: .2rem;
  margin-left: .1rem;
}

.post-author{
  width: .6rem;
  height: .6rem;
  vertical-align: middle;
}

.post-date{
  margin-left: .4rem;
  vertical-align: middle;
}

.post-img{
  width: 100%;
  height: 3.4rem;
  margin: auto 0;
  margin-bottom: .3rem;
}

.post-date{
  font-size: .26rem;
  margin-bottom: .2rem;
}
.post-title{
  font-size: .34rem;
  font-weight: 600;
  color: #333;
  margin-bottom: .2rem;
  margin-left: .2rem;
}
.post-content{
  color: #666;
  font-size: .28rem;
  margin-bottom: .2rem;
  margin-left: .2rem;
  letter-spacing: .02rem;
  line-height: .4rem;
}
.post-like{
  font-size: .26rem;
  line-height: .32rem;
  margin-left: .2rem;
}

.post-like-img{
  height: .32rem;
  width: .32rem;
  margin-right: .16rem;
  vertical-align: middle;
}

.post-like-font{
  vertical-align: middle;
  margin-right: .4rem;
}
</style>

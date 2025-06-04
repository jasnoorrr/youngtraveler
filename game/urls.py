from django.urls import path
from . import views

app_name = 'game'
urlpatterns = [
    path('',            views.home,         name='home'),
    path('settings/',   views.settings,     name='settings'),
    path('tutorial/',   views.tutorial,     name='tutorial'),
    path('start/',      views.start,        name='start'),
    path('episodes/',   views.episodes,     name='episodes'),
    path('play/<int:episode>/', views.play_episode, name='play_episode'),

    # (Optional) to debug static file loading:
    path('debug-static/', lambda r: render(r, 'game/debug_static.html')),
]

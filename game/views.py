from django.shortcuts import render

def home(request):
    return render(request, 'game/home.html')

def settings(request):
    return render(request, 'game/settings.html')

def tutorial(request):
    return render(request, 'game/tutorial.html')

def start(request):
    return render(request, 'game/start.html')

def episodes(request):
    username  = request.GET.get('username', '')
    character = request.GET.get('character', '')
    return render(request, 'game/episodes.html', {
        'username': username,
        'character': character,
    })

def play_episode(request, episode):
    # Convert episode to integer (fallback to 1 if it’s invalid)
    try:
        ep_number = int(episode)
    except (ValueError, TypeError):
        ep_number = 1

    character = request.GET.get('character', 'traveler1')

    # Render the same template (play.html) for both Episode 1 and Episode 2
    return render(request, 'game/play.html', {
        'episode': ep_number,
        'character': character,
    })

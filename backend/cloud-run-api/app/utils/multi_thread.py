from concurrent import futures
from itertools import chain


def multi_thread_flat(iters, func, max_workers=20):
    items = multi_thread(iters, func, max_workers)
    return list(chain.from_iterable(items))


def multi_thread(iters, func, max_workers=20):
    with futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        result_futures = executor.map(func, iters)
        return list(result_futures)
